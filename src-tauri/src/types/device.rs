use serde::{Deserialize, Serialize};

#[derive(Serialize, Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space_mb: u64,
    pub used_space_mb: u64,
    pub is_removable: bool,
    pub file_system: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeMemoryData {
    pub ram_usage: u64,
    pub swap_usage: u64,
    pub ram_capacity: u64,
    pub swap_capacity: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfos {
    pub brand: String,
    pub model: String,
    pub threads: u32,
    pub max_frequency: u16,
    pub virt: bool,
    pub arch: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RealtimeCpuData {
    pub global_usage: f32,
    pub thread_usage: Vec<f32>,
    pub global_frequency: f64,
    pub thread_frequency: Vec<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessDiskUsage {
    pub read: u64,
    pub write: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessMemoryUsage {
    pub ram: u64,
    pub swap: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Process {
    pub pid: u32,
    pub name: String, // ✅ Remplacé &'static str par String
    pub cpu_usage: f32,
    pub memory_usage: ProcessMemoryUsage,
    pub disk_usage: ProcessDiskUsage,
    pub user_id: Option<u32>,  // ✅ Option pour éviter le .unwrap() fatal
    pub group_id: Option<u32>, // ✅ Option pour éviter le .unwrap() fatal
    pub run_time: u64,
}
