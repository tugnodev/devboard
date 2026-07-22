use sysinfo::Disks;

use crate::types::device::DiskInfo;

#[tauri::command]
pub fn get_disks_infos() -> Vec<DiskInfo> {
    // Charge la liste mise à jour des disques
    let disks = Disks::new_with_refreshed_list();

    disks
        .iter()
        .map(|disk| DiskInfo {
            name: disk.name().to_string_lossy().into_owned(),
            mount_point: disk.mount_point().to_string_lossy().into_owned(),
            // Conversion de Octets vers Mo (base-10 standard)
            total_space_mb: disk.total_space() / 1_048_576,
            used_space_mb: (disk.total_space() - disk.available_space()) / 1_048_576,
            is_removable: disk.is_removable(),
            file_system: disk.file_system().to_string_lossy().into_owned(),
        })
        .collect()
}
