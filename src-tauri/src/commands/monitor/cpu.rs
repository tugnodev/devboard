use raw_cpuid::CpuId;
use tauri::{command, AppHandle, Emitter, Manager};
use tokio::time::Duration;

use crate::commands::monitor::system::lock_system;
use crate::types::device::RealtimeCpuData;
use crate::types::{AppState, EmitResponse};

#[command]
pub async fn realtime_cpu_infos(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // Initialisation unique du singleton (si pas déjà done)
        drop(lock_system());
        let cpu_id = CpuId::new();

        loop {
            // Vérifier si le monitoring est toujours actif avant de continuer
            if !app
                .state::<std::sync::Mutex<AppState>>()
                .lock()
                .unwrap_or_else(|e| e.into_inner())
                .active
            {
                break;
            }

            let data = {
                let mut guard = lock_system();
                let Some(sys) = guard.as_mut() else { break };
                sys.refresh_cpu_all();

                let cpus = sys.cpus();
                if cpus.is_empty() {
                    None
                } else {
                    let total: u64 = cpus.iter().map(|c| c.frequency()).sum();
                    let global_usage = sys.global_cpu_usage();
                    let thread_usage = cpus.iter().map(|c| c.cpu_usage()).collect::<Vec<_>>();
                    let global_frequency = total as f64 / cpus.len() as f64;
                    let thread_frequency = cpus.iter().map(|c| c.frequency()).collect::<Vec<_>>();
                    let max_frequency = cpu_id
                        .get_processor_frequency_info()
                        .map(|info| info.processor_max_frequency())
                        .unwrap_or(0);

                    Some(RealtimeCpuData {
                        global_usage,
                        thread_usage,
                        global_frequency,
                        thread_frequency,
                        max_frequency,
                    })
                }
            }; // MutexGuard relâché ici

            match data {
                Some(data) => {
                    if let Err(e) = app.emit(
                        "state-bridge",
                        EmitResponse {
                            state_name: "cpu".to_string(),
                            data,
                        },
                    ) {
                        eprintln!("Erreur lors de l'émission des données : {:?}", e);
                    }
                }
                None => {
                    tokio::time::sleep(Duration::from_millis(1000)).await;
                    continue;
                }
            }

            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}
