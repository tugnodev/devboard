use std::sync::{Arc, Mutex, OnceLock};

use sysinfo::System;

/// Singleton partagé pour `sysinfo::System`.
///
/// `System::new_all()` charge en mémoire tous les processus, fichiers ouverts,
/// et autres métadata système — ce qui coûte cher en RAM. En réutilisant une
/// unique instance partagée, on évite les allocations répétées et on réduit
/// significativement l'empreinte mémoire de l'application.
static SYSTEM: OnceLock<Arc<Mutex<Option<System>>>> = OnceLock::new();

/// Retourne une référence vers l'instance `System` partagée.
///
/// La première appel initialise le singleton avec `System::new_all()`.
/// Les appels suivants réutilisent la même instance.
pub fn get_system() -> &'static Arc<Mutex<Option<System>>> {
    SYSTEM.get_or_init(|| Arc::new(Mutex::new(Some(System::new_all()))))
}

/// Verrouille le singleton et retourne le guard `MutexGuard`.
///
/// # Panics
/// Panique si le mutex est empoisonné (un thread a paniqué en le détenant).
pub fn lock_system() -> std::sync::MutexGuard<'static, Option<System>> {
    get_system().lock().unwrap_or_else(|e| e.into_inner())
}

/// Libère le singleton `System` pour récupérer la mémoire.
///
/// Après cet appel, le prochain `get_system()` réinitialise une nouvelle instance.
pub fn shutdown_system() {
    if let Some(system) = SYSTEM.get() {
        if let Ok(mut guard) = system.lock() {
            *guard = None; // Drop le System, libérant la mémoire
        }
    }
}
