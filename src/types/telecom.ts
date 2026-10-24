/**
 * Definiciones de tipos de datos para ANTISEC | Análisis Telefónico
 * Sistema de Análisis de Sábanas Telefónicas para la Unidad Antisecuestros
 */

export type EventType = 
  | 'VOZ_SALIENTE' 
  | 'VOZ_ENTRANTE' 
  | 'SMS_SALIENTE' 
  | 'SMS_ENTRANTE' 
  | 'DATOS_LTE';

export type NetworkGeneration = '2G' | '3G' | '4G_LTE' | '5G_NR';
export type CallStatus = 'COMPLETADA' | 'NO_CONTESTADA' | 'OCUPADO' | 'FALLIDA';
export type OperatorName = 'TELCEL' | 'AT&T' | 'MOVISTAR' | 'OTRO';

export type LabelCategory = 
  | 'sospechoso' 
  | 'victima' 
  | 'papa' 
  | 'mama' 
  | 'tia' 
  | 'hermano' 
  | 'familiar' 
  | 'dealer' 
  | 'didi' 
  | 'chofer' 
  | 'tienda' 
  | 'cobrador' 
  | 'abogado' 
  | 'contacto_frecuente'
  | 'otro';

export interface PhoneLabel {
  phoneNumber: string;
  label: string;
  category: LabelCategory;
  color: string; // hex color for markers and tags
  notes?: string;
  associatedSuspect?: string;
  caseId: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CellTower {
  id: string; // CGI or Site ID, e.g. "CJZ-1088"
  name: string; // e.g. "Torre Pronaf - Av. Lincoln"
  operator: OperatorName;
  latitude: number;
  longitude: number;
  azimuth: number; // 0 to 360 degrees
  beamWidth?: number; // default 65 or 120 deg
  rangeMeters?: number; // coverage radius (approx 1200m)
  address: string;
  lac?: number;
  cellId?: number;
  mcc?: number;
  mnc?: number;
}

export interface CallDetailRecord {
  id: string;
  caseId: string;
  targetPhone: string; // Teléfono objetivo de la sábana
  numberA: string; // Número que origina
  numberB: string; // Número que recibe
  eventType: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: number; // Unix timestamp en ms para ordenamiento
  durationSeconds: number;
  imei: string;
  imsi: string;
  towerId: string;
  towerName: string;
  latitude: number;
  longitude: number;
  azimuth: number;
  networkType: NetworkGeneration;
  status: CallStatus;
  operator: OperatorName;
  isRoaming: boolean;
  colorTag?: string;
  notes?: string;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string; // ej. "EXP-CJ-2024-0891"
  title: string;
  crimeType: 'Secuestro Agravado' | 'Secuestro Express' | 'Extorsión Telefónica' | 'Privación Ilegal de la Libertad';
  status: 'ACTIVO' | 'EN_PROCESO_JUDICIAL' | 'CONCLUIDO';
  leadInvestigator: string;
  unit: string; // "UECS Ciudad Juárez - Fiscalía General del Estado"
  primaryTargetNumber: string;
  secondaryNumbers: string[];
  totalRecordsCount: number;
  creationDate: string;
  lastUpdated: string;
  summary: string;
}

export interface AntennaConnectionStat {
  tower: CellTower;
  totalConnections: number;
  uniqueNumbersCount: number;
  numbersList: string[];
  totalDurationSeconds: number;
  lastConnectionTimestamp: number;
}

export interface RoutePoint {
  order: number;
  recordId: string;
  timestamp: number;
  date: string;
  time: string;
  towerName: string;
  latitude: number;
  longitude: number;
  azimuth: number;
  eventType: EventType;
  otherParty: string;
  durationSeconds: number;
}

export interface OperatorFileFormatConfig {
  id: string;
  name: string;
  operator: OperatorName;
  description: string;
  expectedHeaders: string[];
  sampleRow: Record<string, string>;
  dateFormat: string;
  timeFormat: string;
}
