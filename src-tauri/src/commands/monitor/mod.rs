use tauri::{AppHandle, Manager};

pub mod cpu;
pub mod disk;
pub mod memory;
pub mod network;
pub mod process;
pub mod system;

#[tauri::command]
pub fn hide_overlay(app: AppHandle) {
    if let Some(window) = app.get_webview_window("overlay") {
        let _ = window.hide();
    }
}

#[tauri::command]
pub fn stop_monitoring(app: AppHandle) {
    // Désactive le monitoring : les loops Rust vont break au prochain cycle
    if let Ok(mut state) = app
        .state::<std::sync::Mutex<crate::types::AppState>>()
        .lock()
    {
        state.active = false;
    }
}

#[tauri::command]
pub async fn start_monitoring(app: AppHandle) {
    if let Ok(mut state) = app
        .state::<std::sync::Mutex<crate::types::AppState>>()
        .lock()
    {
        state.active = true;
    }
    // Démarre les loops Rust pour le monitoring
    cpu::realtime_cpu_infos(app.clone()).await;
    disk::get_disks_infos();
    memory::realtime_memory_infos(app.clone()).await;
    network::realtime_network_stats(app.clone()).await;
    process::realtime_process_infos(app.clone()).await;
}
