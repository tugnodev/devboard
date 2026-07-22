use std::sync::Mutex;

use sysinfo::System;
use tauri::{command, AppHandle, Emitter, Manager};

use crate::types::device::RealtimeMemoryData;
use crate::types::{AppState, EmitResponse};

#[command]
pub async fn realtime_memory_infos(app: AppHandle) {
    tokio::task::spawn(async move {
        let mut sys = System::new_all();

        loop {
            sys.refresh_memory();

            let data = RealtimeMemoryData {
                ram_usage: sys.used_memory(),
                swap_usage: sys.used_swap(),
                ram_capacity: sys.total_memory(),
                swap_capacity: sys.total_swap(),
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
            if !app
                .state::<Mutex<AppState>>()
                .lock()
                .unwrap()
                .overlay_visible
            {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
