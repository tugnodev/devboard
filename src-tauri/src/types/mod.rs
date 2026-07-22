use serde::{Deserialize, Serialize};

pub mod device;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmitResponse<T> {
    pub state_name: String,
    pub data: T,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    pub overlay_visible: bool,
    pub interval: u64,
}
