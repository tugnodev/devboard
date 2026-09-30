use std::sync::Mutex;

use tauri::{command, AppHandle, Emitter, Manager};

use crate::commands::monitor::system::lock_system;
use crate::types::device::RealtimeMemoryData;
use crate::types::{AppState, EmitResponse};

#[command]
pub async fn realtime_memory_infos(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // Initialisation unique du singleton (si pas déjà fait)
        drop(lock_system());

        loop {
            let data = {
                let mut guard = lock_system();
                let Some(sys) = guard.as_mut() else { break };
                sys.refresh_memory();

                RealtimeMemoryData {
                    ram_usage: sys.used_memory(),
                    swap_usage: sys.used_swap(),
                    ram_capacity: sys.total_memory(),
                    swap_capacity: sys.total_swap(),
                }
            };

            if let Err(e) = app.emit(
                "state-bridge",
                EmitResponse {
                    state_name: "memory".to_string(),
                    data,
                },
            ) {
                eprintln!("Erreur lors de l'émission des données : {:?}", e);
            }
            if !app.state::<Mutex<AppState>>().lock().unwrap().active {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
