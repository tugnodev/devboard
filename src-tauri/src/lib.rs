use std::sync::Mutex;

use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
mod commands;
mod types;
use commands::monitor::cpu::{get_cpu_infos, realtime_cpu_infos};
use commands::monitor::disk::get_disks_infos;
use commands::monitor::hide_overlay;
use commands::monitor::stop_monitoring;
use commands::monitor::memory::realtime_memory_infos;
use commands::monitor::network::realtime_network_stats;
use commands::monitor::process::realtime_process_infos;

use types::EmitResponse;

use crate::types::AppState;

fn toggle_overlay(app: &tauri::AppHandle) {
    let overlay = app.get_webview_window("overlay").unwrap();
    let state = app.state::<Mutex<AppState>>();

    if overlay.is_visible().unwrap_or(false) {
        if let Ok(mut state) = state.lock() {
            state.overlay_visible = false;
            state.active = false;
            let _ = app.emit(
                "state-bridge",
                EmitResponse {
                    state_name: "overlay".to_string(),
                    data: AppState {
                        overlay_visible: state.overlay_visible,
                        active: state.active,
                        interval: state.interval,
                    },
                },
            );
        }
        overlay.hide().unwrap();
    } else {
        overlay.show().unwrap();
        overlay.set_focus().unwrap();
        if let Ok(mut state) = state.lock() {
            state.overlay_visible = true;
            state.active = true;
            let _ = app.emit(
                "state-bridge",
                EmitResponse {
                    state_name: "overlay".to_string(),
                    data: AppState {
                        overlay_visible: state.overlay_visible,
                        active: state.active,
                        interval: state.interval,
                    },
                },
            );
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Mutex::new(AppState {
            overlay_visible: false,
            active: false,
            interval: 1000,
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |_app, shortcut, event| {
                    let ctrl_o_shortcut = Shortcut::new(Some(Modifiers::META), Code::KeyM);
                    if shortcut == &ctrl_o_shortcut {
                        if let ShortcutState::Pressed = event.state() {
                            toggle_overlay(_app);
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_cpu_infos,
            realtime_cpu_infos,
            realtime_memory_infos,
            hide_overlay,
            stop_monitoring,
            realtime_network_stats,
            get_disks_infos,
            realtime_process_infos
        ])
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem};
                use tauri::tray::{TrayIconBuilder, TrayIconEvent};

                let ctrl_o_shortcut = Shortcut::new(Some(Modifiers::META), Code::KeyM);

                app.global_shortcut().register(ctrl_o_shortcut)?;

                let settings_item =
                    MenuItem::with_id(app, "settings", "Paramètres", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quitter", true, None::<&str>)?;

                let tray_menu = Menu::with_items(app, &[&settings_item, &quit_item])?;

                let _tray = TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&tray_menu)
                    .on_tray_icon_event(|tray_handle, event| {
                        let app = tray_handle.app_handle();
                        match event {
                            TrayIconEvent::Click {
                                button: tauri::tray::MouseButton::Left,
                                ..
                            } => {
                                toggle_overlay(&app);
                            }
                            _ => {}
                        }
                    })
                    .on_menu_event(|app_handle, event| {
                        match event.id.as_ref() {
                            "settings" => {
                                if let Some(main) = app_handle.get_webview_window("main") {
                                    let _ = main.show();
                                    let _ = main.set_focus();
                                }
                            }
                            "quit" => {
                                app_handle.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .build(app)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
