export type LineStatus = 'running' | 'warning' | 'stopped' | 'maintenance';

export interface ProcessStep {
  id: string;
  name: string;
  stepNumber: number;
  status: 'normal' | 'busy' | 'bottleneck' | 'idle';
  cycleTimeSec: number;
  targetCycleTimeSec: number;
  wipCount: number; // Work In Process
  equipmentName: string;
  temperature?: number;
  utilization: number; // %
}

export interface DefectItem {
  type: string;
  count: number;
  percentage: number;
  category: 'electrical' | 'mechanical' | 'cosmetic' | 'assembly' | 'other';
}

export interface SensorTelemetry {
  temperatureC: number;
  vibrationMmS: number;
  pressureMpa: number;
  powerKw: number;
  rpm?: number;
}

export interface HourlyPoint {
  hour: string;
  operationRate: number; // %
  defectRate: number; // %
  outputCount: number;
}

export interface ProductionLine {
  id: string;
  code: string; // e.g. L01
  name: string;
  category: string;
  currentLot: string;
  operatorCount: number;
  managerName: string;
  status: LineStatus;
  statusMessage: string;
  
  // Production quantities
  targetCount: number;
  actualCount: number;
  goodCount: number;
  defectCount: number;
  
  // Computed / Live metrics
  operationRate: number; // 가동률 (%)
  targetOperationRate: number; // 목표 가동률 (%)
  defectRate: number; // 불량률 (%)
  targetDefectRate: number; // 불량률 상한 (%)
  tactTimeSec: number; // 현재 사이클 타임 (초)
  targetTactTimeSec: number; // 목표 사이클 타임 (초)
  
  // Process steps
  steps: ProcessStep[];
  
  // Pareto defects
  defects: DefectItem[];
  
  // Equipment sensors
  sensors: SensorTelemetry;
  
  // Trend points
  hourlyData: HourlyPoint[];
}

export interface AlarmEvent {
  id: string;
  lineId: string;
  lineCode: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export type ViewTab = 'overview' | 'lines' | 'flow' | 'quality' | 'telemetry';
export type ShiftType = 'all' | 'day' | 'night';
