use std::sync::Mutex;

use crate::commands::monitor::system::lock_system;
use crate::types::device::{Process, ProcessDiskUsage, ProcessMemoryUsage};
use crate::types::{AppState, EmitResponse};
use sysinfo::ProcessesToUpdate;
use tauri::{command, AppHandle, Emitter, Manager};

#[command]
pub async fn realtime_process_infos(app: AppHandle) {
    tokio::task::spawn(async move {
        // Initialisation unique du singleton (si pas déjà fait)
        drop(lock_system());

        loop {
            if !app
                .state::<Mutex<AppState>>()
                .lock()
                .unwrap()
                .active
            {
                break;
            }

            let processes = {
                let mut guard = lock_system();
                let sys = guard.as_mut().unwrap();
                sys.refresh_processes(ProcessesToUpdate::All, true);

                let mut processes: Vec<Process> = sys
                    .processes()
                    .iter()
                    .map(|(_pid, process)| Process {
                        pid: process.pid().as_u32(),
                        name: process.name().to_string_lossy().into_owned(),
                        cpu_usage: process.cpu_usage(),
                        memory_usage: ProcessMemoryUsage {
                            ram: process.memory(),
                            swap: process.virtual_memory(),
                        },
                        disk_usage: ProcessDiskUsage {
                            read: process.disk_usage().read_bytes,
                            write: process.disk_usage().written_bytes,
                        },
                        user_id: process.user_id().map(|uid| **uid),
                        group_id: process.group_id().clone().map(|gid| *gid),
                        run_time: process.run_time(),
                    })
                    .collect();

                // Tri par CPU décroissant (utilise partial_cmp pour éviter la troncature)
                processes.sort_by(|a, b| {
                    b.cpu_usage
                        .partial_cmp(&a.cpu_usage)
                        .unwrap_or(std::cmp::Ordering::Equal)
                });

                processes
            };

            if let Err(e) = app.emit::<EmitResponse<Vec<Process>>>(
                "state-bridge",
                EmitResponse {
                    state_name: "processes".to_string(),
                    data: processes,
                },
            ) {
                eprintln!("Erreur lors de l'émission des données : {:?}", e)
            }

            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
