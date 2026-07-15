//! Creation and placement of the reminder popup window.
//!
//! The reminder is a MODAL: a fullscreen, transparent, always-on-top overlay
//! that swallows every click until "Yes" or "Remind me in 5 minutes" is
//! pressed. The visible card is drawn bottom-right by the React layer; the
//! rest of the window is a dimmed click-shield.

use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder};

pub const REMINDER_LABEL: &str = "reminder";

/// Show the fullscreen reminder overlay on the primary monitor.
pub fn show_reminder(app: &AppHandle) -> tauri::Result<()> {
    // Already open (e.g. snooze fired again) → restart its animation.
    if let Some(win) = app.get_webview_window(REMINDER_LABEL) {
        win.show()?;
        win.set_focus()?;
        win.emit("reminder-replay", ())?;
        return Ok(());
    }

    let builder = WebviewWindowBuilder::new(
        app,
        REMINDER_LABEL,
        WebviewUrl::App("reminder.html".into()),
    )
    .title("hai Pengu ❤️")
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false) // no OS close button / Alt+F4 shortcut path
    .focused(true) // modal: it SHOULD take focus until answered
    .visible(false); // sized & positioned first (avoids flicker)

    // "All workspaces" is a macOS concept; setting it on Windows can fail.
    #[cfg(target_os = "macos")]
    let builder = builder.visible_on_all_workspaces(true);

    let win = builder.build()?;

    // Cover the entire primary monitor so clicks anywhere are captured.
    if let Some(monitor) = win.primary_monitor()? {
        win.set_position(PhysicalPosition::new(
            monitor.position().x,
            monitor.position().y,
        ))?;
        win.set_size(*monitor.size())?;
    }

    win.show()?;
    win.set_focus()?;
    Ok(())
}

/// Close the popup (called by the frontend after the exit animation ends).
pub fn close_reminder(app: &AppHandle) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window(REMINDER_LABEL) {
        // `destroy` bypasses the `closable(false)` guard we set above.
        win.destroy()?;
    }
    Ok(())
}
