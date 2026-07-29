use std::{sync::Mutex, time::SystemTime};

use netdev::{self};
use serde::{Deserialize, Serialize};
use sysinfo::{NetworkData, Networks};
use tauri::{AppHandle, Emitter, Manager};

use crate::types::{AppState, EmitResponse};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkStats {
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub timestamp: SystemTime,
}

#[tauri::command]
pub async fn realtime_network_stats(app: AppHandle) {
    tokio::task::spawn(async move {
        let mut net = Networks::new_with_refreshed_list();

        loop {
            net.refresh(true);

            let interface: (&String, &NetworkData);
            match netdev::get_default_interface() {
                Ok(default) => {
                    interface = net.list().get_key_value(&default.name).unwrap();
                }

                Err(e) => {
                    println!("{:?}", e);
                    break;
                }
            };

            let stats = NetworkStats {
                bytes_received: interface.1.received(),
                bytes_sent: interface.1.transmitted(),
                timestamp: netdev::get_default_interface()
                    .unwrap()
                    .stats
                    .unwrap()
                    .timestamp
                    .unwrap(),
            };

            if let Err(e) = app.emit::<EmitResponse<NetworkStats>>(
                "state-bridge",
                EmitResponse {
                    state_name: "network".to_string(),
                    data: stats,
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
