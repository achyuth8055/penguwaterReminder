//! Hydro Buddy — Tauri core.
//!
//! Responsibilities:
//! * plugins: store (persistence), autostart (launch at login)
//! * background reminder scheduler
//! * reminder popup window management
//! * tray icon so the app keeps running when the dashboard is closed

mod commands;
mod scheduler;
mod window;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            // Start the scheduler and expose it to commands.
            let sched = scheduler::Scheduler::init(app.handle());
            app.manage(sched);

            // Tray icon: the app lives in the background between reminders.
            let open = MenuItem::with_id(app, "open", "Open Dashboard", true, None::<&str>)?;
            let drink = MenuItem::with_id(app, "drink", "Water check now", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Pengu", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &drink, &quit])?;

            TrayIconBuilder::with_id("tray")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("hai Pengu ❤️")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    "drink" => {
                        // Spawn off the event-loop thread (Windows-safe).
                        let app = app.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = window::show_reminder(&app) {
                                eprintln!("[tray] reminder failed: {e}");
                            }
                        });
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|win, event| {
            match (win.label(), event) {
                // Closing the dashboard hides it instead of quitting, so the
                // scheduler keeps running in the background.
                ("main", WindowEvent::CloseRequested { api, .. }) => {
                    let _ = win.hide();
                    api.prevent_close();
                }
                // The reminder is modal: if she clicks away / Alt-Tabs,
                // pull it right back until Yes or Later is pressed.
                ("reminder", WindowEvent::Focused(false)) => {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.set_focus();
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::confirm_drink,
            commands::snooze_reminder,
            commands::set_interval,
            commands::get_schedule,
            commands::show_reminder_now,
            commands::close_reminder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pengu");
}
