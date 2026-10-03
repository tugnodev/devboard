import { tauriInvoke } from '$lib/services/tauri';

class ProjectService {
  async openProject(path: string) {
    return await tauriInvoke('open_project', { path });
  }

  async openInEditor(path: string) {
    return await tauriInvoke('open_in_editor', { path });
  }

  async openInTerminal(path: string) {
    return await tauriInvoke('open_in_terminal', { path });
  }

  async deleteProject(path: string) {
    return await tauriInvoke('delete_project', { path });
  }
}

export const projectService = new ProjectService();
