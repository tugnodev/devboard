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

export interface NetworkStats {
  bytesSent: number,
  bytesReceived: number,
  timestampSecs: number;
}

export interface RealtimeCpuData {
  globalUsage: number;
  threadUsage: number[];
  globalFrequency: number;
  threadFrequency: number[];
  maxFrequency: number,
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

export interface DiskInfo {
  name: string;
  mountPoint: string;
  totalSpaceMb: number;
  usedSpaceMb: number;
  isRemovable: boolean;
  fileSystem: string;
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
