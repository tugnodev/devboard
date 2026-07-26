use std::sync::Mutex;

use crate::types::device::{Process, ProcessDiskUsage, ProcessMemoryUsage};
use crate::types::{AppState, EmitResponse};
use sysinfo::{ProcessesToUpdate, System};
use tauri::{command, AppHandle, Emitter, Manager};

#[command]
pub async fn realtime_process_infos(app: AppHandle) {
    tokio::task::spawn(async move {
        let mut sys = System::new_all();
        loop {
            if !app
                .state::<Mutex<AppState>>()
                .lock()
                .unwrap()
                .overlay_visible
            {
                break;
            }

            sys.refresh_processes(ProcessesToUpdate::All, true);
            let processes: Vec<Process> = sys
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
