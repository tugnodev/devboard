use std::sync::Mutex;

use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
mod commands;
mod types;
use commands::monitor::cpu::{get_cpu_infos, realtime_cpu_infos};
use commands::monitor::disk::get_disks_infos;
use commands::monitor::hide_overlay;
use commands::monitor::memory::realtime_memory_infos;
use commands::monitor::network::realtime_network_stats;
use commands::monitor::process::realtime_process_infos;

use types::EmitResponse;

use crate::types::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(AppState {
            overlay_visible: false,
            interval: 1000,
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |_app, shortcut, event| {
                    let ctrl_o_shortcut = Shortcut::new(Some(Modifiers::META), Code::KeyD);
                    if shortcut == &ctrl_o_shortcut {
                        match event.state() {
                            ShortcutState::Pressed => {
                                println!("Meta-O Pressed!");
                                let overlay = _app.get_webview_window("overlay").unwrap();
                                let state = _app.state::<Mutex<AppState>>();
                                match overlay.is_visible().unwrap_or(false) {
                                    true => {
                                        if let Ok(mut state) = state.lock() {
                                            state.overlay_visible = false;
                                            let _ = _app.emit(
                                                "state-bridge",
                                                EmitResponse {
                                                    state_name: "overlay".to_string(),
                                                    data: AppState {
                                                        overlay_visible: state.overlay_visible,
                                                        interval: state.interval,
                                                    },
                                                },
                                            );

                                            std::thread::sleep(std::time::Duration::from_millis(
                                                300,
                                            ));
                                            overlay.hide().unwrap();
                                        }
                                    }
                                    false => {
                                        overlay.show().unwrap();
                                        if let Ok(mut state) = state.lock() {
                                            state.overlay_visible = true;
                                            let _ = _app.emit(
                                                "state-bridge",
                                                EmitResponse {
                                                    state_name: "overlay".to_string(),
                                                    data: AppState {
                                                        overlay_visible: state.overlay_visible,
                                                        interval: state.interval,
                                                    },
                                                },
                                            );
                                        }
                                    }
                                };
                            }
                            ShortcutState::Released => {
                                println!("Meta-D Released!");
                            }
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
            realtime_network_stats,
            get_disks_infos,
            realtime_process_infos
        ])
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem};
                use tauri::tray::{TrayIconBuilder, TrayIconEvent};

                let ctrl_o_shortcut = Shortcut::new(Some(Modifiers::META), Code::KeyD);

                app.global_shortcut().register(ctrl_o_shortcut)?;

                let toggle_item =
                    MenuItem::with_id(app, "open", "Préférences", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quitter", true, None::<&str>)?;

                let tray_menu = Menu::with_items(app, &[&toggle_item, &quit_item])?;

                // 3. Construction du Tray Icon
                let _tray = TrayIconBuilder::new()
                    // Charge l'icône automatiquement depuis src-tauri/icons/icon.png (ou autre configuré)
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&tray_menu)
                    .on_tray_icon_event(|tray_handle, event| {
                        let app = tray_handle.app_handle();
                        if let Some(window) = app.get_webview_window("overlay") {
                            match event {
                                // Clic gauche direct sur l'icône -> On toggle la fenêtre
                                TrayIconEvent::Click {
                                    button: tauri::tray::MouseButton::Left,
                                    ..
                                } => {
                                    if window.is_visible().unwrap_or(false) {
                                        window.hide().unwrap();
                                    } else {
                                        window.show().unwrap();
                                        window.set_focus().unwrap();
                                    }
                                }
                                _ => {}
                            }
                        }
                    })
                    .on_menu_event(|app_handle, event| {
                        // 4. Gestion des clics sur les éléments du menu
                        match event.id.as_ref() {
                            "open" => {
                                let webview = app_handle.get_webview_window("main");
                                match webview {
                                    Some(webview) => {
                                        webview.show().unwrap();
                                        webview.set_focus().unwrap();
                                        println!("focus");
                                    }
                                    None => {
                                        use tauri::WebviewWindow;

                                        println!("closed");
                                        let _webview = WebviewWindow::builder(
                                            app_handle,
                                            "main",
                                            tauri::WebviewUrl::App("/".into()),
                                        )
                                        .inner_size(414.00, 896.00)
                                        .build()
                                        .unwrap();
                                    }
                                }
                            }
                            "quit" => {
                                let webview = app_handle.get_webview_window("main");
                                if let Some(webview) = webview {
                                    webview.hide().unwrap();
                                }
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
