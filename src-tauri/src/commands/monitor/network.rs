use std::sync::Mutex;

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
    pub timestamp_secs: u64,
}

#[tauri::command]
pub async fn realtime_network_stats(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut net = Networks::new_with_refreshed_list();

        loop {
            // Vérifier si le monitoring est toujours actif avant de continuer
            if !app
                .state::<Mutex<AppState>>()
                .lock()
                .unwrap_or_else(|e| e.into_inner())
                .active
            {
                break;
            }

            net.refresh(true);

            let stats = match netdev::get_default_interface() {
                Ok(default) => {
                    let interface = net.list().get_key_value(&default.name);
                    match interface {
                        Some((_, data)) => {
                            NetworkStats {
                                bytes_received: data.received() / 1024,
                                bytes_sent: data.transmitted() / 1024,
                                timestamp_secs: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .map(|d| d.as_secs())
                                    .unwrap_or(0),
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
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
