//! Tauri commands exposed to the webviews.

use std::sync::Arc;
use tauri::{AppHandle, State};

use crate::scheduler::{ScheduleState, Scheduler};
use crate::window;

/// User pressed "Yes" — schedule the next full interval.
/// (The glass itself is logged to the store by the frontend first.)
#[tauri::command]
pub fn confirm_drink(app: AppHandle, scheduler: State<Arc<Scheduler>>) {
    scheduler.confirm(&app);
}

/// User pressed "Remind me in 5 minutes".
#[tauri::command]
pub fn snooze_reminder(app: AppHandle, scheduler: State<Arc<Scheduler>>, minutes: Option<u64>) {
    scheduler.snooze(&app, minutes.unwrap_or(5));
}

/// Settings screen changed the reminder interval.
#[tauri::command]
pub fn set_interval(app: AppHandle, scheduler: State<Arc<Scheduler>>, minutes: u64) {
    scheduler.set_interval(&app, minutes);
}

/// Current schedule (for the dashboard countdown).
#[tauri::command]
pub fn get_schedule(scheduler: State<Arc<Scheduler>>) -> ScheduleState {
    scheduler.state()
}

/// "Preview reminder" button / tray item — show the popup immediately.
#[tauri::command]
pub fn show_reminder_now(app: AppHandle) -> Result<(), String> {
    window::show_reminder(&app).map_err(|e| e.to_string())
}

/// Called by the popup after its fade-out animation completes.
#[tauri::command]
pub fn close_reminder(app: AppHandle) -> Result<(), String> {
    window::close_reminder(&app).map_err(|e| e.to_string())
}
