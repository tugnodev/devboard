use raw_cpuid::CpuId;
use std::env;
use tauri::{command, AppHandle, Emitter, Manager};
use tokio::time::Duration;

use crate::commands::monitor::system::lock_system;
use crate::types::device::{CpuInfos, RealtimeCpuData};
use crate::types::{AppState, EmitResponse};

#[command]
pub async fn realtime_cpu_infos(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // Initialisation unique du singleton (si pas déjà fait)
        drop(lock_system());

        loop {
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

                    Some(RealtimeCpuData {
                        global_usage,
                        thread_usage,
                        global_frequency,
                        thread_frequency,
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

            if !app
                .state::<std::sync::Mutex<AppState>>()
                .lock()
                .unwrap()
                .active
            {
                break;
            }

            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
        return;
    });
}

#[command]
pub fn get_cpu_infos() -> CpuInfos {
    let guard = lock_system();
    let Some(sys) = guard.as_ref() else {
        return CpuInfos {
            brand: String::new(),
            model: String::new(),
            threads: 0,
            max_frequency: 0,
            virt: false,
            arch: String::new(),
        };
    };
    let cpus = sys.cpus();
    let cpu_id = CpuId::new();
    let brand = cpu_id
        .get_vendor_info()
        .map(|v| v.to_string())
        .unwrap_or_default();
    let mut virt = false;

    // 1. Est-ce un processeur Intel avec le flag VMX (Virtual Machine Extensions) ?
    if let Some(feature_info) = cpu_id.get_feature_info() {
        if feature_info.has_vmx() {
            virt = true;
        }
    }

    CpuInfos {
        brand: brand,
        model: cpus
            .first()
            .map(|c| c.brand().to_string())
            .unwrap_or_default(),
        threads: cpus.len() as u32,
        max_frequency: cpu_id
            .get_processor_frequency_info()
            .map(|info| info.processor_max_frequency())
            .unwrap_or(0),
        virt: virt,
        arch: env::consts::ARCH.to_string(),
    }
}
