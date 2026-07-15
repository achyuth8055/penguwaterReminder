//! Background reminder scheduler.
//!
//! Runs on Tauri's async runtime (tokio) inside the Rust core, so reminders
//! fire even when no webview window is open. The next fire time is persisted
//! to the store file; combined with launch-at-login this makes the schedule
//! survive reboots (a reminder missed while the machine was off fires shortly
//! after startup).

use serde::Serialize;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_store::StoreExt;
use tokio::sync::Notify;

use crate::window;

pub const STORE_FILE: &str = "hydro-buddy.json";
const KEY_NEXT_FIRE: &str = "scheduler.nextFireAtMs";
const KEY_SETTINGS: &str = "settings";
const DEFAULT_INTERVAL_MIN: u64 = 60;
/// Grace period before firing a reminder that was missed while powered off.
const MISSED_GRACE_MS: i64 = 30_000;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleState {
    pub next_fire_at_ms: i64,
    pub interval_minutes: u64,
}

struct Inner {
    interval_minutes: u64,
    next_fire_at_ms: i64,
}

/// Shared scheduler handle (managed as Tauri state).
pub struct Scheduler {
    inner: Mutex<Inner>,
    /// Woken whenever the schedule changes so the sleep loop re-evaluates.
    changed: Arc<Notify>,
}

fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

impl Scheduler {
    /// Load persisted state and start the background loop.
    pub fn init(app: &AppHandle) -> Arc<Self> {
        let store = app.store(STORE_FILE).expect("failed to open store");

        // Interval comes from the settings object the frontend maintains.
        let interval_minutes = store
            .get(KEY_SETTINGS)
            .and_then(|s| s.get("intervalMinutes").and_then(|v| v.as_u64()))
            .unwrap_or(DEFAULT_INTERVAL_MIN);

        // Resume the persisted fire time; recover if it's in the past.
        let persisted = store.get(KEY_NEXT_FIRE).and_then(|v| v.as_i64());
        let next_fire_at_ms = match persisted {
            Some(t) if t > now_ms() => t,
            Some(_) => now_ms() + MISSED_GRACE_MS, // missed while asleep/off
            None => now_ms() + (interval_minutes as i64) * 60_000,
        };

        let scheduler = Arc::new(Self {
            inner: Mutex::new(Inner { interval_minutes, next_fire_at_ms }),
            changed: Arc::new(Notify::new()),
        });

        scheduler.persist(app);
        scheduler.clone().spawn_loop(app.clone());
        scheduler
    }

    fn spawn_loop(self: Arc<Self>, app: AppHandle) {
        tauri::async_runtime::spawn(async move {
            loop {
                let wait_ms = {
                    let inner = self.inner.lock().unwrap();
                    (inner.next_fire_at_ms - now_ms()).max(0) as u64
                };

                tokio::select! {
                    _ = tokio::time::sleep(std::time::Duration::from_millis(wait_ms)) => {
                        // Time to remind. Push the next fire far into the
                        // future; the popup's answer will reschedule properly.
                        // (If the app is force-killed mid-popup, the persisted
                        // past time triggers the missed-reminder recovery.)
                        if let Err(e) = window::show_reminder(&app) {
                            eprintln!("[scheduler] failed to open reminder: {e}");
                            // Retry in 1 minute rather than spinning.
                            self.set_next(&app, now_ms() + 60_000);
                        } else {
                            self.set_next(&app, i64::MAX / 2);
                        }
                    }
                    _ = self.changed.notified() => { /* re-evaluate wait */ }
                }
            }
        });
    }

    fn set_next(&self, app: &AppHandle, at_ms: i64) {
        {
            let mut inner = self.inner.lock().unwrap();
            inner.next_fire_at_ms = at_ms;
        }
        self.persist(app);
        self.changed.notify_waiters();
        let _ = app.emit("schedule-updated", self.state());
    }

    fn persist(&self, app: &AppHandle) {
        if let Ok(store) = app.store(STORE_FILE) {
            let inner = self.inner.lock().unwrap();
            store.set(KEY_NEXT_FIRE, serde_json::json!(inner.next_fire_at_ms));
            let _ = store.save();
        }
    }

    pub fn state(&self) -> ScheduleState {
        let inner = self.inner.lock().unwrap();
        ScheduleState {
            next_fire_at_ms: inner.next_fire_at_ms,
            interval_minutes: inner.interval_minutes,
        }
    }

    /// User confirmed a drink → next reminder after one full interval.
    pub fn confirm(&self, app: &AppHandle) {
        let interval = self.inner.lock().unwrap().interval_minutes as i64;
        self.set_next(app, now_ms() + interval * 60_000);
    }

    /// User snoozed → come back in `minutes`.
    pub fn snooze(&self, app: &AppHandle, minutes: u64) {
        self.set_next(app, now_ms() + minutes as i64 * 60_000);
    }

    /// Settings changed the interval → restart the countdown.
    pub fn set_interval(&self, app: &AppHandle, minutes: u64) {
        {
            let mut inner = self.inner.lock().unwrap();
            inner.interval_minutes = minutes.max(1);
        }
        let interval = self.inner.lock().unwrap().interval_minutes as i64;
        self.set_next(app, now_ms() + interval * 60_000);
    }
}
