export interface ProcessMemoryUsage {
	ram: number;
	swap: number;
}

export interface ProcessDiskUsage {
	read: number;
	write: number;
}

export interface Process {
	pid: number;
	name: string;
	cpuUsage: number;
	memoryUsage: ProcessMemoryUsage;
	diskUsage: ProcessDiskUsage;
	userId?: number;
	groupId?: number;
	runTime: number;
}

export interface Disk {
    name: string;
    mountPoint: string;
    totalSpaceMb: number;
    usedSpaceMb: number;
    isRemovable: boolean;
    fileSystem: string;
}

export interface SystemTime {
  secs_since_epoch: number;
  nanos_since_epoch: number;
}

export interface NetworkStats {
  bytesSent: number,
  bytesReceived: number,
  timestamp: SystemTime;
}

export interface cpuInfos {
  brand: string;
  model: string;
  cores: number;
  threads: number;
  frequency: number;
  maxFrequency: number;
  virt: boolean;
  arch: string;
}

export interface RealtimeCpuData {
  globalUsage: number;
  threadUsage: number[];
  globalFrequency: number;
  threadFrequency: number[];
}

export interface RealtimeMemoryData {
  ramUsage: number,
  swapUsage: number,
  ramCapacity: number,
  swapCapacity: number
}

export interface memoryInfos {
  capacity: number;
  usage: number;
  technologie: string;
  speed: number;
  type: string;
  slots: number;
  usedSlots: number;
  swap?: {
    usage: number;
    capacity: number;
  };
}

export interface diskInfos {
  type: string;
  capacity: number;
  mountPoint: string;
  writable: boolean;
  removable: boolean;
}

export interface networkInfos {
  manufacturer: string;
  interface: string;
  mac: string;
  ip: string;
  networkName: string;
  link: string;
  linkSpeed: number;
}

export interface Device {
  brand: string;
  model: string;
  os: string;
  version: string;
  cpu: cpuInfos;
  memory: memoryInfos;
  network: networkInfos;
  disk: diskInfos;
  battery?: number;
}
