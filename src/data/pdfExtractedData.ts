/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Datos estructurados extraídos directamente de los dictámenes periciales en PDF:
 * 1. 6271218386_finalizado_5a1987e7.pdf (Red de Vínculos de Comunicación - UAYC)
 * 2. 6271218386_infomraci_n_extra_da_I2_d8519f17.pdf (Información Extraída IBM i2 Analyst's Notebook)
 */

export interface PdfCommunicationEvent {
  id: string;
  type: 'LL-S' | 'LL-E' | 'M-E' | 'LL-Transito' | 'LL-TRANSFER' | 'DATOS';
  typeLabel: string;
  date: string;
  time: string;
  durationSeconds?: number;
  durationFormatted?: string;
  targetNumber: string; // 6271218386
  counterpart: string;
  category: 'contacto_clave' | 'sospechoso' | 'servicio' | 'operador' | 'datos_ip' | 'frecuente';
  sourceDoc: 'vinculos' | 'i2' | 'ambos';
  notes?: string;
}

export interface PdfLinkNode {
  number: string;
  name?: string;
  role: string;
  category: 'frecuente' | 'sospechoso' | 'operador' | 'servicio' | 'nodo_i2';
  totalOutgoing: number; // LL-S
  totalIncomingCalls: number; // LL-E
  totalIncomingMessages: number; // M-E
  totalTransits: number;
  maxDurationSeconds: number;
  totalDurationSeconds: number;
  firstSeen: string;
  lastSeen: string;
  positionHint: 'left' | 'right' | 'top' | 'bottom';
  events: PdfCommunicationEvent[];
}

export interface PdfDataSession {
  id: string;
  date: string;
  time: string;
  durationSeconds: number;
  volumeBytesApprox?: string;
  apn: string;
}

export const PDF_DOCUMENTS = [
  {
    id: 'vinculos',
    title: 'Red de Vínculos de Comunicación (UAYC)',
    code: 'UAYC-A07-6271218386',
    path: '/assets/aistudio/6271218386_finalizado_5a1987e7.pdf',
    fileName: '6271218386_finalizado_5a1987e7.pdf',
    description: 'Matriz gráfica pericial de llamadas entrantes, salientes y SMS del 22/01/2025 al 31/01/2025 con simbología cromática institucional (Azul=Entrante, Rojo=Saliente).',
    unit: 'UAYC · Unidad de Análisis y Contexto / UECS',
    badge: 'Red de Vínculos Oficial',
    targetNumber: '6271218386'
  },
  {
    id: 'i2',
    title: 'Extracción Forense IBM i2 Analyst\'s Notebook',
    code: 'i2-AN-6271218386-D85',
    path: '/assets/aistudio/6271218386_infomraci_n_extra_da_I2_d8519f17.pdf',
    fileName: '6271218386_infomraci_n_extra_da_I2_d8519f17.pdf',
    description: 'Topología exhaustiva de llamadas en tránsito, transferencias de llamada, duraciones periciales en segundos y 70+ sesiones de tráfico de datos continuos.',
    unit: 'Área de Extracción de Inteligencia Criminal i2',
    badge: 'Volcado i2 y Tráfico LTE',
    targetNumber: '6271218386'
  }
];

export const PRIMARY_TARGET = {
  phoneNumber: '6271218386',
  label: 'Línea Objetivo Principal Auditada',
  carrier: 'Telcel Radiomovil Dipsa',
  period: '22/01/2025 al 31/01/2025',
  totalInteractions: 146,
  uniqueContacts: 18,
  totalCallDurationSeconds: 4321
};

export const PDF_LINK_NODES: PdfLinkNode[] = [
  {
    number: '6271134588',
    name: 'Interlocutor Frecuente Principal',
    role: 'Máxima Densidad de Contacto (20 eventos)',
    category: 'frecuente',
    totalOutgoing: 13,
    totalIncomingCalls: 5,
    totalIncomingMessages: 2,
    totalTransits: 13,
    maxDurationSeconds: 426,
    totalDurationSeconds: 1530,
    firstSeen: '22/01/2025 11:34:45',
    lastSeen: '31/01/2025 21:21:25',
    positionHint: 'left',
    events: [
      { id: 'ev-1', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '22/01/2025', time: '11:34:45', durationSeconds: 287, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-2', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '11:44:49', durationSeconds: 100, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-3', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '22/01/2025', time: '11:51:42', durationSeconds: 426, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-4', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '22/01/2025', time: '12:08:06', durationSeconds: 19, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-5', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '12:10:13', durationSeconds: 88, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-6', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '22/01/2025', time: '12:14:47', durationSeconds: 53, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-7', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '12:28:27', durationSeconds: 75, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-8', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '22/01/2025', time: '12:32:56', durationSeconds: 119, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-9', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '15:14:40', durationSeconds: 1, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-10', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '23/01/2025', time: '18:51:20', durationSeconds: 63, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-11', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '24/01/2025', time: '06:50:10', durationSeconds: 29, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-12', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '25/01/2025', time: '17:58:30', durationSeconds: 62, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-13', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '25/01/2025', time: '19:12:37', durationSeconds: 42, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-14', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '25/01/2025', time: '21:54:17', durationSeconds: 53, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-15', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '26/01/2025', time: '07:31:45', durationSeconds: 68, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-16', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '27/01/2025', time: '19:24:38', durationSeconds: 38, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-17', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '29/01/2025', time: '18:08:22', durationSeconds: 79, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-18', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '29/01/2025', time: '21:43:15', durationSeconds: 90, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-19', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '29/01/2025', time: '21:34:05', durationSeconds: 1, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' },
      { id: 'ev-20', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '31/01/2025', time: '21:21:25', durationSeconds: 35, targetNumber: '6271218386', counterpart: '6271134588', category: 'contacto_clave', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271474227',
    name: 'Comunicación de Mayor Duración',
    role: 'Llamada Extensa Crítica (1,245 seg / 20.7 min)',
    category: 'sospechoso',
    totalOutgoing: 1,
    totalIncomingCalls: 2,
    totalIncomingMessages: 0,
    totalTransits: 3,
    maxDurationSeconds: 1245,
    totalDurationSeconds: 1284,
    firstSeen: '26/01/2025 15:11:37',
    lastSeen: '29/01/2025 19:54:20',
    positionHint: 'left',
    events: [
      { id: 'ev-21', type: 'LL-S', typeLabel: 'Llamada Saliente (Extensa)', date: '26/01/2025', time: '15:11:37', durationSeconds: 1245, targetNumber: '6271218386', counterpart: '6271474227', category: 'sospechoso', sourceDoc: 'ambos', notes: 'Llamada de 20 minutos y 45 segundos continuos' },
      { id: 'ev-22', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '29/01/2025', time: '18:34:49', durationSeconds: 23, targetNumber: '6271218386', counterpart: '6271474227', category: 'sospechoso', sourceDoc: 'ambos' },
      { id: 'ev-23', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '29/01/2025', time: '19:54:20', durationSeconds: 16, targetNumber: '6271218386', counterpart: '6271474227', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271449752',
    name: 'Línea de Madrugada / Cierre',
    role: 'Comunicaciones Salientes Nocturnas',
    category: 'sospechoso',
    totalOutgoing: 2,
    totalIncomingCalls: 0,
    totalIncomingMessages: 0,
    totalTransits: 2,
    maxDurationSeconds: 76,
    totalDurationSeconds: 107,
    firstSeen: '29/01/2025 19:35:15',
    lastSeen: '30/01/2025 05:50:47',
    positionHint: 'left',
    events: [
      { id: 'ev-24', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '29/01/2025', time: '19:35:15', durationSeconds: 76, targetNumber: '6271218386', counterpart: '6271449752', category: 'sospechoso', sourceDoc: 'ambos' },
      { id: 'ev-25', type: 'LL-S', typeLabel: 'Llamada Saliente Madrugada', date: '30/01/2025', time: '05:50:47', durationSeconds: 31, targetNumber: '6271218386', counterpart: '6271449752', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271148264',
    name: 'Línea Saliente Matutina',
    role: 'Evento 24/01 06:17 hrs',
    category: 'sospechoso',
    totalOutgoing: 1,
    totalIncomingCalls: 0,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 84,
    totalDurationSeconds: 84,
    firstSeen: '24/01/2025 06:17:17',
    lastSeen: '24/01/2025 06:17:17',
    positionHint: 'left',
    events: [
      { id: 'ev-26', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '24/01/2025', time: '06:17:17', durationSeconds: 84, targetNumber: '6271218386', counterpart: '6271148264', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271231031',
    name: 'Contacto Tarde 26/01',
    role: 'Llamada Saliente 355 segundos (6 min)',
    category: 'sospechoso',
    totalOutgoing: 1,
    totalIncomingCalls: 0,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 355,
    totalDurationSeconds: 355,
    firstSeen: '26/01/2025 16:53:38',
    lastSeen: '26/01/2025 16:53:38',
    positionHint: 'left',
    events: [
      { id: 'ev-27', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '26/01/2025', time: '16:53:38', durationSeconds: 355, targetNumber: '6271218386', counterpart: '6271231031', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271030501',
    name: 'Contacto 24/01 Vespertino',
    role: 'Llamada Saliente 53 segundos',
    category: 'sospechoso',
    totalOutgoing: 1,
    totalIncomingCalls: 0,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 53,
    totalDurationSeconds: 53,
    firstSeen: '24/01/2025 16:51:13',
    lastSeen: '24/01/2025 16:51:13',
    positionHint: 'left',
    events: [
      { id: 'ev-28', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '24/01/2025', time: '16:51:13', durationSeconds: 53, targetNumber: '6271218386', counterpart: '6271030501', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271430295',
    name: 'Contacto 23/01',
    role: 'Llamada Saliente 28 segundos',
    category: 'sospechoso',
    totalOutgoing: 1,
    totalIncomingCalls: 0,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 28,
    totalDurationSeconds: 28,
    firstSeen: '23/01/2025 19:08:24',
    lastSeen: '23/01/2025 19:08:24',
    positionHint: 'left',
    events: [
      { id: 'ev-29', type: 'LL-S', typeLabel: 'Llamada Saliente', date: '23/01/2025', time: '19:08:24', durationSeconds: 28, targetNumber: '6271218386', counterpart: '6271430295', category: 'sospechoso', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6565901978',
    name: 'Lada Juárez (656)',
    role: 'Llamada Entrante Foránea Cd. Juárez',
    category: 'frecuente',
    totalOutgoing: 0,
    totalIncomingCalls: 1,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 9,
    totalDurationSeconds: 9,
    firstSeen: '27/01/2025 11:26:20',
    lastSeen: '27/01/2025 11:26:20',
    positionHint: 'right',
    events: [
      { id: 'ev-30', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '27/01/2025', time: '11:26:20', durationSeconds: 9, targetNumber: '6271218386', counterpart: '6565901978', category: 'frecuente', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271130597',
    name: 'Contacto Frecuente Entrante',
    role: 'Llamadas Entrantes Nocturnas',
    category: 'frecuente',
    totalOutgoing: 0,
    totalIncomingCalls: 2,
    totalIncomingMessages: 0,
    totalTransits: 2,
    maxDurationSeconds: 37,
    totalDurationSeconds: 62,
    firstSeen: '22/01/2025 19:56:17',
    lastSeen: '25/01/2025 20:55:11',
    positionHint: 'right',
    events: [
      { id: 'ev-31', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '19:56:17', durationSeconds: 37, targetNumber: '6271218386', counterpart: '6271130597', category: 'frecuente', sourceDoc: 'ambos' },
      { id: 'ev-32', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '25/01/2025', time: '20:55:11', durationSeconds: 25, targetNumber: '6271218386', counterpart: '6271130597', category: 'frecuente', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271181113',
    name: 'Contacto Entrante 23/01',
    role: 'Llamada Entrante 292 seg (casi 5 min)',
    category: 'frecuente',
    totalOutgoing: 0,
    totalIncomingCalls: 1,
    totalIncomingMessages: 0,
    totalTransits: 1,
    maxDurationSeconds: 292,
    totalDurationSeconds: 292,
    firstSeen: '23/01/2025 17:55:48',
    lastSeen: '23/01/2025 17:55:48',
    positionHint: 'right',
    events: [
      { id: 'ev-33', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '23/01/2025', time: '17:55:48', durationSeconds: 292, targetNumber: '6271218386', counterpart: '6271181113', category: 'frecuente', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '6271331238',
    name: 'Contacto Entrante Múltiple',
    role: '3 Llamadas Entrantes (22 y 23 Enero)',
    category: 'frecuente',
    totalOutgoing: 0,
    totalIncomingCalls: 3,
    totalIncomingMessages: 0,
    totalTransits: 3,
    maxDurationSeconds: 110,
    totalDurationSeconds: 211,
    firstSeen: '22/01/2025 19:22:47',
    lastSeen: '23/01/2025 19:36:17',
    positionHint: 'right',
    events: [
      { id: 'ev-34', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '19:22:47', durationSeconds: 6, targetNumber: '6271218386', counterpart: '6271331238', category: 'frecuente', sourceDoc: 'ambos' },
      { id: 'ev-35', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '22/01/2025', time: '19:43:42', durationSeconds: 95, targetNumber: '6271218386', counterpart: '6271331238', category: 'frecuente', sourceDoc: 'ambos' },
      { id: 'ev-36', type: 'LL-E', typeLabel: 'Llamada Entrante', date: '23/01/2025', time: '19:36:17', durationSeconds: 110, targetNumber: '6271218386', counterpart: '6271331238', category: 'frecuente', sourceDoc: 'ambos' }
    ]
  },
  {
    number: 'BUZON',
    name: 'Buzón de Voz Telcel',
    role: 'Servicio Notificación Mensajes en Buzón',
    category: 'servicio',
    totalOutgoing: 0,
    totalIncomingCalls: 0,
    totalIncomingMessages: 3,
    totalTransits: 0,
    maxDurationSeconds: 0,
    totalDurationSeconds: 0,
    firstSeen: '22/01/2025 15:14:45',
    lastSeen: '29/01/2025 21:34:10',
    positionHint: 'right',
    events: [
      { id: 'ev-37', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '15:14:45', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'BUZON', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-38', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '15:14:48', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'BUZON', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-39', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '29/01/2025', time: '21:34:10', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'BUZON', category: 'servicio', sourceDoc: 'ambos' }
    ]
  },
  {
    number: 'Telcel / 47288 / 142323',
    name: 'Sistema SMS Operador Telcel',
    role: 'Alertas de Saldo, Recargas y Roaming',
    category: 'operador',
    totalOutgoing: 0,
    totalIncomingCalls: 0,
    totalIncomingMessages: 15,
    totalTransits: 0,
    maxDurationSeconds: 0,
    totalDurationSeconds: 0,
    firstSeen: '22/01/2025 08:18:11',
    lastSeen: '29/01/2025 13:38:14',
    positionHint: 'right',
    events: [
      { id: 'ev-40', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '08:18:11', durationSeconds: 1, targetNumber: '6271218386', counterpart: '142323', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-41', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '10:02:34', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'Telcel', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-42', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '22/01/2025', time: '11:36:42', durationSeconds: 1, targetNumber: '6271218386', counterpart: '47288', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-43', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '25/01/2025', time: '17:58:59', durationSeconds: 1, targetNumber: '6271218386', counterpart: '47288', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-44', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '26/01/2025', time: '16:55:21', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'TELCEL', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-45', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '28/01/2025', time: '10:59:22', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'Telcel', category: 'operador', sourceDoc: 'ambos' },
      { id: 'ev-46', type: 'M-E', typeLabel: 'Mensaje Entrante', date: '29/01/2025', time: '09:15:46', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'Telcel', category: 'operador', sourceDoc: 'ambos' }
    ]
  },
  {
    number: 'UNOTV.COM',
    name: 'Boletines Informativos SMS',
    role: 'Servicio Noticioso Automatizado (19 alertas)',
    category: 'servicio',
    totalOutgoing: 0,
    totalIncomingCalls: 0,
    totalIncomingMessages: 19,
    totalTransits: 0,
    maxDurationSeconds: 0,
    totalDurationSeconds: 0,
    firstSeen: '22/01/2025 18:51:24',
    lastSeen: '31/01/2025 20:52:56',
    positionHint: 'right',
    events: [
      { id: 'ev-47', type: 'M-E', typeLabel: 'SMS Informativo', date: '22/01/2025', time: '18:51:24', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-48', type: 'M-E', typeLabel: 'SMS Informativo', date: '22/01/2025', time: '20:42:32', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-49', type: 'M-E', typeLabel: 'SMS Informativo', date: '23/01/2025', time: '16:29:50', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-50', type: 'M-E', typeLabel: 'SMS Informativo', date: '24/01/2025', time: '21:02:20', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-51', type: 'M-E', typeLabel: 'SMS Informativo', date: '26/01/2025', time: '20:57:58', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' },
      { id: 'ev-52', type: 'M-E', typeLabel: 'SMS Informativo', date: '31/01/2025', time: '20:52:56', durationSeconds: 1, targetNumber: '6271218386', counterpart: 'UNOTV.COM', category: 'servicio', sourceDoc: 'ambos' }
    ]
  },
  {
    number: '614-SERIES (i2)',
    name: 'Números Adicionales Topología i2',
    role: 'Lada Chihuahua (6144517513, 6144584683)',
    category: 'nodo_i2',
    totalOutgoing: 0,
    totalIncomingCalls: 2,
    totalIncomingMessages: 0,
    totalTransits: 2,
    maxDurationSeconds: 14,
    totalDurationSeconds: 24,
    firstSeen: '22/01/2025 14:13:32',
    lastSeen: '29/01/2025 21:13:17',
    positionHint: 'bottom',
    events: [
      { id: 'ev-53', type: 'LL-TRANSFER', typeLabel: 'Llamada Transferida', date: '22/01/2025', time: '14:13:32', durationSeconds: 3, targetNumber: '6271218386', counterpart: '6144517513', category: 'sospechoso', sourceDoc: 'i2' },
      { id: 'ev-54', type: 'LL-TRANSFER', typeLabel: 'Llamada Transferida', date: '29/01/2025', time: '21:13:16', durationSeconds: 5, targetNumber: '6271218386', counterpart: '6144584683', category: 'sospechoso', sourceDoc: 'i2' }
    ]
  }
];

export const PDF_DATA_SESSIONS_SAMPLE: PdfDataSession[] = [
  { id: 'ds-1', date: '22/01/2025', time: '00:26:42', durationSeconds: 95, volumeBytesApprox: '142 KB', apn: 'internet.itelcel.com' },
  { id: 'ds-2', date: '22/01/2025', time: '00:45:32', durationSeconds: 867, volumeBytesApprox: '1.2 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-3', date: '22/01/2025', time: '01:02:19', durationSeconds: 706, volumeBytesApprox: '980 KB', apn: 'internet.itelcel.com' },
  { id: 'ds-4', date: '22/01/2025', time: '09:45:14', durationSeconds: 3600, volumeBytesApprox: '8.4 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-5', date: '22/01/2025', time: '10:45:14', durationSeconds: 3601, volumeBytesApprox: '12.1 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-6', date: '22/01/2025', time: '11:45:15', durationSeconds: 3563, volumeBytesApprox: '15.6 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-7', date: '22/01/2025', time: '12:53:58', durationSeconds: 3600, volumeBytesApprox: '22.4 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-8', date: '22/01/2025', time: '13:53:58', durationSeconds: 4817, volumeBytesApprox: '34.8 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-9', date: '24/01/2025', time: '00:31:50', durationSeconds: 3600, volumeBytesApprox: '4.2 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-10', date: '24/01/2025', time: '02:31:50', durationSeconds: 7201, volumeBytesApprox: '18.9 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-11', date: '24/01/2025', time: '08:31:51', durationSeconds: 3600, volumeBytesApprox: '21.0 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-12', date: '26/01/2025', time: '01:35:44', durationSeconds: 4661, volumeBytesApprox: '14.5 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-13', date: '29/01/2025', time: '22:33:48', durationSeconds: 4915, volumeBytesApprox: '27.1 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-14', date: '30/01/2025', time: '16:26:41', durationSeconds: 6237, volumeBytesApprox: '58.4 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-15', date: '31/01/2025', time: '19:31:53', durationSeconds: 4911, volumeBytesApprox: '43.2 MB', apn: 'internet.itelcel.com' },
  { id: 'ds-16', date: '31/01/2025', time: '23:32:47', durationSeconds: 2585, volumeBytesApprox: '19.8 MB', apn: 'internet.itelcel.com' }
];

export const FORENSIC_INSIGHTS = [
  {
    title: 'Interlocutor Central Frecuente (6271134588)',
    severity: 'ALTA',
    description: 'Registra 20 interacciones bidireccionales continuas (13 llamadas salientes, 5 entrantes y 2 SMS). Mantiene contacto recurrente tanto en horarios diurnos como en aperturas y cierres de jornada.',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  {
    title: 'Llamada de Duración Anómala (6271474227)',
    severity: 'CRÍTICA',
    description: 'El día 26/01/2025 a las 15:11:37 se estableció una comunicación saliente de 1,245 segundos (20 minutos con 45 segundos), siendo la interacción de mayor permanencia en toda la sábana.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    title: 'Vínculos de Madrugada (6271449752)',
    severity: 'MEDIA',
    description: 'Eventos salientes registrados a las 19:35 hrs del 29/01 y a las 05:50:47 hrs del 30/01 (madrugada), lo que denota coordinación operativa o alertas inmediatas.',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  },
  {
    title: 'Sesiones de Tráfico de Datos Nocturnas (LTE)',
    severity: 'INFORMATIVA',
    description: 'El análisis i2 revela conexiones IP ininterrumpidas de 3,600 a 7,201 segundos durante las madrugadas del 24, 26 y 30 de enero, evidenciando actividad continua o streaming/mensajería en segundo plano.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  }
];
