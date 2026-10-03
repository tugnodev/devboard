# DevBoard

DevBoard is a Tauri overlay app for system monitoring and project management.

## Features

- Real-time system monitoring (CPU, RAM, swap, network, disks, processes, services)
- Project management with tags, languages, and frameworks
- Global shortcut (Meta+M) to toggle the overlay
- System tray with settings and quit options

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Development

```bash
bun install
bun run tauri:dev
```

## Build

```bash
bun run tauri:build
```
