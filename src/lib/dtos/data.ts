export type WindowsService = {
    name: string;
    displayName: string;
    status: "Running" | "Stopped" | "Paused" | "StartPending" | "StopPending" | "ContinuePending";
    startType: "Automatic" | "Manual" | "Disabled" | "DelayedAutomatic";
    binaryPath: string;
    pid: number | null;
    account: string;
};

export type LinuxService = {
    name: string;
    description: string;
    loadState: "loaded" | "not-found" | "error" | "masked";
    activeState: "active" | "inactive" | "activating" | "deactivating" | "failed";
    subState: "running" | "exited" | "dead" | "listening" | "failed";
    enabledState: "enabled" | "disabled" | "static" | "generated";
    pid: number | null;
    memoryBytes: number | null;
};

export type SystemService =
    | { os: "windows"; data: WindowsService[] }
    | { os: "linux"; data: LinuxService[] };

const mockWindowsServices: WindowsService[] = [
  { name: "wuauserv", displayName: "Windows Update", status: "Running", startType: "DelayedAutomatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k netsvcs -p", pid: 1244, account: "nt authority\\localsystem" },
  { name: "Spooler", displayName: "Print Spooler", status: "Stopped", startType: "Automatic", binaryPath: "C:\\Windows\\System32\\spoolsv.exe", pid: null, account: "LocalSystem" },
  { name: "ssh-agent", displayName: "OpenSSH Authentication Agent", status: "Stopped", startType: "Disabled", binaryPath: "C:\\Windows\\System32\\OpenSSH\\ssh-agent.exe", pid: null, account: "NT AUTHORITY\\NetworkService" },
  { name: "Docker Desktop Service", displayName: "Docker Desktop Service", status: "Running", startType: "Manual", binaryPath: "\"C:\\Program Files\\Docker\\Docker\\DockerDesktop.exe\" -service", pid: 4812, account: "LocalSystem" },
  { name: "Dhcp", displayName: "DHCP Client", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k LocalServiceNetworkRestricted -p", pid: 816, account: "NT AUTHORITY\\LocalService" },
  { name: "Dnscache", displayName: "DNS Client", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k NetworkService -p", pid: 924, account: "NT AUTHORITY\\NetworkService" },
  { name: "EventLog", displayName: "Windows Event Log", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k LocalServiceNetworkRestricted -p", pid: 612, account: "NT AUTHORITY\\LocalService" },
  { name: "Winmgmt", displayName: "Windows Management Instrumentation", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k netsvcs -p", pid: 1048, account: "nt authority\\localsystem" },
  { name: "MSSQLSERVER", displayName: "SQL Server (MSSQLSERVER)", status: "Stopped", startType: "Manual", binaryPath: "\"C:\\Program Files\\Microsoft SQL Server\\MSSQL16.MSSQLSERVER\\MSSQL\\Binn\\sqlservr.exe\" -sMSSQLSERVER", pid: null, account: "NT SERVICE\\MSSQLSERVER" },
  { name: "MongoDB", displayName: "MongoDB Server", status: "Running", startType: "Automatic", binaryPath: "\"C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe\" --config \"C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.cfg\" --service", pid: 3412, account: "NT AUTHORITY\\NetworkService" },
  { name: "redis-server", displayName: "Redis Server", status: "Running", startType: "Automatic", binaryPath: "\"C:\\Program Files\\Redis\\redis-server.exe\" --service-run", pid: 2984, account: "LocalSystem" },
  { name: "Audiosrv", displayName: "Windows Audio", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k LocalServiceNetworkRestricted -p", pid: 1420, account: "NT AUTHORITY\\LocalService" },
  { name: "WerSvc", displayName: "Windows Error Reporting Service", status: "Stopped", startType: "Manual", binaryPath: "C:\\Windows\\System32\\WerSvc.dll", pid: null, account: "NT AUTHORITY\\LocalSystem" },
  { name: "Themes", displayName: "Themes", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k netsvcs -p", pid: 1532, account: "NT AUTHORITY\\LocalService" },
  { name: "BITS", displayName: "Background Intelligent Transfer Service", status: "Paused", startType: "Manual", binaryPath: "C:\\Windows\\System32\\bitsadmin.exe", pid: 4012, account: "NT AUTHORITY\\LocalSystem" },
  { name: "FontCache", displayName: "Windows Font Cache Service", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k LocalService -p", pid: 1104, account: "NT AUTHORITY\\LocalService" },
  { name: "ClickToRunSvc", displayName: "Microsoft Office Click-to-Run Service", status: "Running", startType: "Automatic", binaryPath: "\"C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeClickToRun.exe\"", pid: 1840, account: "NT AUTHORITY\\SYSTEM" },
  { name: "DiagTrack", displayName: "Connected User Experiences and Telemetry", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k utcsvc -p", pid: 2104, account: "NT AUTHORITY\\LocalSystem" },
  { name: "SysMain", displayName: "SysMain", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k netsvcs -p", pid: 2280, account: "NT AUTHORITY\\LocalSystem" },
  { name: "TermService", displayName: "Remote Desktop Services", status: "Stopped", startType: "Manual", binaryPath: "C:\\Windows\\System32\\svchost.exe -k NetworkService -p", pid: null, account: "NT AUTHORITY\\NetworkService" },
  { name: "WbioSrvc", displayName: "Windows Biometric Service", status: "Stopped", startType: "Manual", binaryPath: "C:\\Windows\\system32\\wbiosrvc.dll", pid: null, account: "NT AUTHORITY\\LocalSystem" },
  { name: "BluetoothUserService_42a1b", displayName: "Bluetooth User Support Service", status: "StartPending", startType: "Manual", binaryPath: "C:\\Windows\\system32\\svchost.exe -k UnistackSvcGroup", pid: 6732, account: "LocalSystem" },
  { name: "WmdmPmSp", displayName: "Portable Device Enumerator Service", status: "Stopped", startType: "Manual", binaryPath: "C:\\Windows\\system32\\wmdmpmsp.dll", pid: null, account: "NT AUTHORITY\\LocalSystem" },
  { name: "mpssvc", displayName: "Windows Defender Firewall", status: "Running", startType: "Automatic", binaryPath: "C:\\Windows\\system32\\svchost.exe -k LocalServiceNoNetwork -p", pid: 744, account: "NT AUTHORITY\\LocalService" },
  { name: "vmicvss", displayName: "Hyper-V Volume Shadow Copy Requestor", status: "Stopped", startType: "Manual", binaryPath: "C:\\Windows\\System32\\vmicvss.dll", pid: null, account: "NT AUTHORITY\\LocalSystem" }
];

const mockLinuxServices: LinuxService[] = [
  { name: "nginx.service", description: "A high performance web server and a reverse proxy server", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 945, memoryBytes: 1024 * 1024 * 42 },
  { name: "postgresql.service", description: "PostgreSQL database server", loadState: "loaded", activeState: "inactive", subState: "dead", enabledState: "disabled", pid: null, memoryBytes: null },
  { name: "docker.service", description: "Docker Application Container Engine", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 812, memoryBytes: 1024 * 1024 * 145 },
  { name: "apache2.service", description: "The Apache HTTP Server", loadState: "error", activeState: "failed", subState: "failed", enabledState: "enabled", pid: null, memoryBytes: null },
  { name: "ssh.service", description: "OpenBSD Secure Shell server", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 720, memoryBytes: 1024 * 1024 * 8 },
  { name: "systemd-journald.service", description: "Journal Service", loadState: "loaded", activeState: "active", subState: "running", enabledState: "static", pid: 312, memoryBytes: 1024 * 1024 * 28 },
  { name: "cron.service", description: "Regular background program processing daemon", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 654, memoryBytes: 1024 * 1024 * 4 },
  { name: "ufw.service", description: "Uncomplicated firewall", loadState: "loaded", activeState: "active", subState: "exited", enabledState: "enabled", pid: null, memoryBytes: null },
  { name: "redis-server.service", description: "Advanced key-value store", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 1022, memoryBytes: 1024 * 1024 * 85 },
  { name: "mysql.service", description: "MySQL Community Server", loadState: "loaded", activeState: "inactive", subState: "dead", enabledState: "disabled", pid: null, memoryBytes: null },
  { name: "systemd-resolved.service", description: "Network Name Resolution", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 410, memoryBytes: 1024 * 1024 * 16 },
  { name: "NetworkManager.service", description: "Network Manager", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 580, memoryBytes: 1024 * 1024 * 22 },
  { name: "bluetooth.service", description: "Bluetooth service", loadState: "loaded", activeState: "inactive", subState: "dead", enabledState: "enabled", pid: null, memoryBytes: null },
  { name: "gdm.service", description: "GNOME Display Manager", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 1102, memoryBytes: 1024 * 1024 * 64 },
  { name: "fail2ban.service", description: "Ban hosts that cause multiple authentication errors", loadState: "loaded", activeState: "activating", subState: "listening", enabledState: "enabled", pid: 5410, memoryBytes: 1024 * 1024 * 31 },
  { name: "influxdb.service", description: "InfluxDB time series database", loadState: "loaded", activeState: "active", subState: "running", enabledState: "disabled", pid: 2194, memoryBytes: 1024 * 1024 * 210 },
  { name: "snapd.service", description: "Snap Daemon", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 884, memoryBytes: 1024 * 1024 * 45 },
  { name: "cups.service", description: "CUPS Scheduler", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 615, memoryBytes: 1024 * 1024 * 12 },
  { name: "rsyslog.service", description: "System Logging Service", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 690, memoryBytes: 1024 * 1024 * 7 },
  { name: "node-app.service", description: "Custom Production Node.js Backend", loadState: "loaded", activeState: "failed", subState: "failed", enabledState: "generated", pid: null, memoryBytes: null },
  { name: "avahi-daemon.service", description: "Avahi mDNS/DNS-SD Daemon", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 502, memoryBytes: 1024 * 1024 * 5 },
  { name: "smartmontools.service", description: "Self Monitoring and Reporting Technology (SMART) Daemon", loadState: "loaded", activeState: "active", subState: "running", enabledState: "enabled", pid: 711, memoryBytes: 1024 * 1024 * 9 },
  { name: "libvirtd.service", description: "Virtualization daemon", loadState: "loaded", activeState: "inactive", subState: "dead", enabledState: "disabled", pid: null, memoryBytes: null },
  { name: "tg-bot.service", description: "Telegram Automation Bot Daemon", loadState: "masked", activeState: "inactive", subState: "dead", enabledState: "disabled", pid: null, memoryBytes: null },
  { name: "acpid.service", description: "ACPI event daemon", loadState: "loaded", activeState: "active", subState: "running", enabledState: "static", pid: 480, memoryBytes: 1024 * 1024 * 3 }
];

export const linuxMockSystemServices: () => LinuxService[] = () => {
    return mockLinuxServices;
};

export const windowsMockSystemServices: () => WindowsService[] = () => {
    return mockWindowsServices;
};
