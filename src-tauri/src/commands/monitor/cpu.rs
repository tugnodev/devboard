use raw_cpuid::CpuId;
use std::env;
use std::sync::Mutex;
use sysinfo::System;
use tauri::{command, AppHandle, Emitter, Manager};
use tokio::time::Duration;

use crate::types::device::{CpuInfos, RealtimeCpuData};
use crate::types::{AppState, EmitResponse};

#[command]
pub async fn realtime_cpu_infos(app: AppHandle) {
    tokio::task::spawn(async move {
        let mut sys = System::new_all();

        loop {
            // 2. On rafraîchit uniquement les données CPU (beaucoup plus léger)
            sys.refresh_cpu_all();

            let cpus = sys.cpus();

            // Sécurité au cas où la liste des CPUs est vide
            if cpus.is_empty() {
                tokio::time::sleep(Duration::from_millis(1000)).await;
                continue;
            }

            let total: u64 = cpus.iter().map(|c| c.frequency()).sum();
            let global_usage = sys.global_cpu_usage();
            let thread_usage = cpus.iter().map(|c| c.cpu_usage()).collect::<Vec<_>>();
            let global_frequency = total as f64 / cpus.len() as f64;
            let thread_frequency = cpus.iter().map(|c| c.frequency()).collect::<Vec<_>>();

            let data = RealtimeCpuData {
                global_usage,
                thread_usage,
                global_frequency,
                thread_frequency,
            };

            if let Err(e) = app.emit(
                "state-bridge",
                EmitResponse {
                    state_name: "cpu".to_string(),
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

            // 3. La pause d'une seconde bien propre
            tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        }
    });
}

#[command]
pub fn get_cpu_infos() -> CpuInfos {
    let mut sys = System::new_all();
    sys.refresh_cpu_all();
    let cpus = sys.cpus();
    let cpu_id = CpuId::new();
    let brand = cpu_id.get_vendor_info().unwrap().to_string();
    let mut virt = false;

    // 1. Est-ce un processeur Intel avec le flag VMX (Virtual Machine Extensions) ?
    if let Some(feature_info) = cpu_id.get_feature_info() {
        if feature_info.has_vmx() {
            virt = true;
        }
    }

    CpuInfos {
        brand: brand,
        model: cpus[0].brand().to_string(),
        threads: cpus.len() as u32,
        max_frequency: cpu_id
            .get_processor_frequency_info()
            .unwrap()
            .processor_max_frequency(),
        virt: virt,
        arch: env::consts::ARCH.to_string(),
    }
}
