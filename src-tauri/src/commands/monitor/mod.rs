use tauri::{AppHandle, Manager};

pub mod cpu;
pub mod disk;
pub mod memory;
pub mod network;
pub mod process;
pub mod system;

#[tauri::command]
pub fn hide_overlay(app: AppHandle) {
    let window = app.get_webview_window("overlay").unwrap();
    window.hide().unwrap();
}

#[tauri::command]
pub fn stop_monitoring(app: AppHandle) {
    // Désactive le monitoring : les loops Rust vont break au prochain cycle
    if let Ok(mut state) = app.state::<std::sync::Mutex<crate::types::AppState>>().lock() {
        state.active = false;
    }
    // Libère les ressources système
    system::shutdown_system();
}
