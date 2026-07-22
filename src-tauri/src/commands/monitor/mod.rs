use tauri::{AppHandle, Manager};

pub mod cpu;
pub mod disk;
pub mod memory;
pub mod network;
pub mod process;

#[tauri::command]
pub fn hide_overlay(app: AppHandle) {
    let window = app.get_webview_window("overlay").unwrap();
    window.hide().unwrap();
}
