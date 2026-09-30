use std::{sync::Mutex, time::SystemTime};

use netdev::{self};
use serde::{Deserialize, Serialize};
use sysinfo::Networks;
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

            let stats = match netdev::get_default_interface() {
                Ok(default) => {
                    let interface = net.list().get_key_value(&default.name);
                    match interface {
                        Some((_, data)) => {
                            let timestamp = match netdev::get_default_interface() {
                                Ok(iface) => match iface.stats {
                                    Some(stats) => stats.timestamp.unwrap_or_else(SystemTime::now),
                                    None => SystemTime::now(),
                                },
                                Err(_) => SystemTime::now(),
                            };

                            NetworkStats {
                                bytes_received: data.received() / 1024,
                                bytes_sent: data.transmitted() / 1024,
                                timestamp,
                            }
                        }
                        None => {
                            eprintln!(
                                "Interface réseau '{}' non trouvée dans sysinfo",
                                default.name
                            );
                            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
                            continue;
                        }
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Erreur lors de la récupération de l'interface par défaut : {:?}",
                        e
                    );
                    break;
                }
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
                .active
            {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
