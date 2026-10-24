/**
 * DATOS SINTÉTICOS DE PRUEBA
 * Entorno de prueba forense de telecomunicaciones - Ciudad Juárez, Chihuahua
 * AVISO: Todos los nombres, números telefónicos, coordenadas y expedientes son simulados con fines analíticos.
 */

import { CallDetailRecord, CellTower, InvestigationCase, OperatorFileFormatConfig, PhoneLabel } from '../types/telecom';

export const MOCK_TOWERS: CellTower[] = [
  {
    id: 'CJZ-1088',
    name: 'Torre Pronaf - Av. Lincoln',
    operator: 'TELCEL',
    latitude: 31.7380,
    longitude: -106.4420,
    azimuth: 45,
    beamWidth: 65,
    rangeMeters: 1400,
    address: 'Av. Abraham Lincoln s/n, Zona Pronaf, 32315 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 10881,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-1089',
    name: 'Torre Centro - Av. 16 de Septiembre',
    operator: 'TELCEL',
    latitude: 31.7410,
    longitude: -106.4850,
    azimuth: 120,
    beamWidth: 65,
    rangeMeters: 1100,
    address: 'Av. 16 de Septiembre y Calle Juárez, Centro Histórico, 32000 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 10892,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-2044',
    name: 'Torre Anapra - Cerros de Anapra',
    operator: 'AT&T',
    latitude: 31.7850,
    longitude: -106.5410,
    azimuth: 210,
    beamWidth: 65,
    rangeMeters: 2200,
    address: 'Calle Rémora y Delfín, Rancho Anapra, 32107 Cd Juárez, Chih.',
    lac: 5011,
    cellId: 20441,
    mcc: 334,
    mnc: 50
  },
  {
    id: 'CJZ-3091',
    name: 'Torre Gómez Morín - Plaza Juárez Mall',
    operator: 'TELCEL',
    latitude: 31.7050,
    longitude: -106.4020,
    azimuth: 300,
    beamWidth: 65,
    rangeMeters: 1600,
    address: 'Blvd. Manuel Gómez Morín 7921, Fuentes del Bosque, 32539 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 30913,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-4155',
    name: 'Torre Las Misiones - Av. Teófilo Borunda',
    operator: 'TELCEL',
    latitude: 31.6880,
    longitude: -106.3980,
    azimuth: 90,
    beamWidth: 65,
    rangeMeters: 1300,
    address: 'Av. Paseo de la Victoria 4370, Partido Senecú, 32618 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 41552,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-5012',
    name: 'Torre Zaragoza - Carretera Juárez-Porvenir',
    operator: 'MOVISTAR',
    latitude: 31.6380,
    longitude: -106.3240,
    azimuth: 180,
    beamWidth: 65,
    rangeMeters: 1900,
    address: 'Carretera Juárez Porvenir Km 12.5, Zaragoza, 32700 Cd Juárez, Chih.',
    lac: 6300,
    cellId: 50121,
    mcc: 334,
    mnc: 30
  },
  {
    id: 'CJZ-6208',
    name: 'Torre Praderas del Sol',
    operator: 'TELCEL',
    latitude: 31.6120,
    longitude: -106.3890,
    azimuth: 330,
    beamWidth: 65,
    rangeMeters: 1800,
    address: 'Av. Mezquital y Calle Sol de Mayo, Praderas del Sol, 32695 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 62082,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-7100',
    name: 'Torre Aeropuerto Abraham González',
    operator: 'AT&T',
    latitude: 31.6360,
    longitude: -106.4290,
    azimuth: 60,
    beamWidth: 65,
    rangeMeters: 2500,
    address: 'Carretera Panamericana Km 18.5, Aeropuerto, 32690 Cd Juárez, Chih.',
    lac: 5011,
    cellId: 71001,
    mcc: 334,
    mnc: 50
  },
  {
    id: 'CJZ-8043',
    name: 'Torre Sendero - Blvd. Francisco Villarreal',
    operator: 'TELCEL',
    latitude: 31.6250,
    longitude: -106.3680,
    azimuth: 240,
    beamWidth: 65,
    rangeMeters: 1500,
    address: 'Blvd. Francisco Villarreal Torres 2050, 32545 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 80433,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-9114',
    name: 'Torre El Campanario',
    operator: 'TELCEL',
    latitude: 31.7220,
    longitude: -106.3810,
    azimuth: 15,
    beamWidth: 65,
    rangeMeters: 1200,
    address: 'Av. Valle de Juárez y San Jerónimo, El Campanario, 32320 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 91141,
    mcc: 334,
    mnc: 20
  },
  {
    id: 'CJZ-1102',
    name: 'Torre Riberas del Bravo - Sector 4',
    operator: 'MOVISTAR',
    latitude: 31.6010,
    longitude: -106.2890,
    azimuth: 150,
    beamWidth: 65,
    rangeMeters: 2400,
    address: 'Calle Rivera del Peñasco y Rivera de Mayo, Riberas del Bravo, 32599 Cd Juárez, Chih.',
    lac: 6300,
    cellId: 11022,
    mcc: 334,
    mnc: 30
  },
  {
    id: 'CJZ-1250',
    name: 'Torre Parque Industrial Juárez',
    operator: 'TELCEL',
    latitude: 31.6640,
    longitude: -106.4410,
    azimuth: 270,
    beamWidth: 65,
    rangeMeters: 1700,
    address: 'Eje Vial Juan Gabriel y Ponciano Arriaga, 32670 Cd Juárez, Chih.',
    lac: 4120,
    cellId: 12503,
    mcc: 334,
    mnc: 20
  }
];

export const MOCK_CASES: InvestigationCase[] = [
  {
    id: 'CASE-2024-0891',
    caseNumber: 'EXP-CJ-2024-0891',
    title: 'Secuestro Agravado Empresario Zona Pronaf',
    crimeType: 'Secuestro Agravado',
    status: 'ACTIVO',
    leadInvestigator: 'Cmdte. R. Valenzuela / Analista H. Méndez',
    unit: 'Unidad Especializada en Combate al Secuestro (UECS Juárez)',
    primaryTargetNumber: '656-789-2041',
    secondaryNumbers: ['656-312-9988', '656-554-1122', '656-654-0011', '656-991-3344'],
    totalRecordsCount: 1420,
    creationDate: '2024-10-14',
    lastUpdated: '2024-10-24 10:15',
    summary: 'Privación ilegal de la libertad ocurrida en Av. Lincoln. Se detectan comunicaciones extorsivas originadas con salto de celdas entre Pronaf, Anapra y Praderas del Sol.'
  },
  {
    id: 'CASE-2024-0412',
    caseNumber: 'EXP-CJ-2024-0412',
    title: 'Extorsión Telefónica y Cobro de Rescate Comercial',
    crimeType: 'Extorsión Telefónica',
    status: 'EN_PROCESO_JUDICIAL',
    leadInvestigator: 'Lic. M. Estrada / Perito Telecom G. Ramos',
    unit: 'Unidad de Inteligencia Táctica UECS',
    primaryTargetNumber: '656-880-1299',
    secondaryNumbers: ['656-441-7700', '656-112-8877'],
    totalRecordsCount: 890,
    creationDate: '2024-09-02',
    lastUpdated: '2024-10-21 16:40',
    summary: 'Llamadas intimidatorias exigiendo depósito de rescate. Antenas coincidentes en corredor Gómez Morín y Zaragoza.'
  },
  {
    id: 'CASE-2024-0105',
    caseNumber: 'EXP-CJ-2024-0105',
    title: 'Célula de Contención - Ruta Poniente',
    crimeType: 'Privación Ilegal de la Libertad',
    status: 'ACTIVO',
    leadInvestigator: 'Mtro. C. Treviño',
    unit: 'Fiscalía de Distrito Zona Norte',
    primaryTargetNumber: '656-991-3344',
    secondaryNumbers: ['656-789-2041', '656-209-4455'],
    totalRecordsCount: 2310,
    creationDate: '2024-08-11',
    lastUpdated: '2024-10-23 09:30',
    summary: 'Rastreo de aparatos desechables con triangulación de celdas y co-localización en casas de seguridad.'
  }
];

export const INITIAL_PHONE_LABELS: PhoneLabel[] = [
  {
    phoneNumber: '656-789-2041',
    label: 'Sospechoso 1 / Celular Negociador',
    category: 'sospechoso',
    color: '#EF4444', // Red
    notes: 'Aparato utilizado en las llamadas de exigencia económica iniciales.',
    associatedSuspect: 'Alias "El Cuervo"',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-18 14:22',
    updatedBy: 'Analista H. Méndez'
  },
  {
    phoneNumber: '656-312-9988',
    label: 'Sospechoso 2 / Halcón Móvil',
    category: 'sospechoso',
    color: '#F97316', // Orange
    notes: 'Registra movilidad coincidente previa al momento del evento.',
    associatedSuspect: 'Sujeto no identificado (Sector Poniente)',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-19 11:05',
    updatedBy: 'Analista H. Méndez'
  },
  {
    phoneNumber: '656-554-1122',
    label: 'Víctima (Celular Personal)',
    category: 'victima',
    color: '#3B82F6', // Blue
    notes: 'Aparato asegurado apagado a las 19:42 del 14/10/2024.',
    associatedSuspect: 'Víctima directa',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-15 08:30',
    updatedBy: 'Perito G. Ramos'
  },
  {
    phoneNumber: '656-489-3321',
    label: 'Papá / Denunciante Principal',
    category: 'papa',
    color: '#10B981', // Emerald
    notes: 'Padre de la víctima, recibió 4 llamadas extorsivas de 656-789-2041.',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-15 10:15',
    updatedBy: 'Lic. M. Estrada'
  },
  {
    phoneNumber: '656-209-4455',
    label: 'Mamá',
    category: 'mama',
    color: '#06B6D4', // Cyan
    notes: 'Madre de familia, sin llamadas directas de sospechosos.',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-15 10:16',
    updatedBy: 'Lic. M. Estrada'
  },
  {
    phoneNumber: '656-890-7766',
    label: 'Tía Consuelo',
    category: 'tia',
    color: '#8B5CF6', // Purple
    notes: 'Contacto familiar recurrente durante las horas posteriores al secuestro.',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-16 12:40',
    updatedBy: 'Analista H. Méndez'
  },
  {
    phoneNumber: '656-654-0011',
    label: 'Didi / Chofer Plataforma',
    category: 'didi',
    color: '#F59E0B', // Amber
    notes: 'Vehículo sedán blanco que trasladó a la víctima antes del levantón.',
    associatedSuspect: 'Chofer bajo indagatoria',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-17 17:50',
    updatedBy: 'Cmdte. R. Valenzuela'
  },
  {
    phoneNumber: '656-991-3344',
    label: 'Dealer / Proveedor Anapra',
    category: 'dealer',
    color: '#DC2626', // Dark Red
    notes: 'Intercambio constante con sospechoso 1 en horas de la madrugada.',
    associatedSuspect: 'Alias "El Moreno"',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-20 22:15',
    updatedBy: 'Analista H. Méndez'
  },
  {
    phoneNumber: '656-112-8877',
    label: 'Tienda de Conveniencia (Recargas)',
    category: 'tienda',
    color: '#64748B', // Slate
    notes: 'Terminal de punto de venta donde compraron saldo los sospechosos.',
    caseId: 'CASE-2024-0891',
    updatedAt: '2024-10-21 14:10',
    updatedBy: 'Analista H. Méndez'
  }
];

export const OPERATOR_FORMATS: OperatorFileFormatConfig[] = [
  {
    id: 'FMT-TELCEL',
    name: 'Formato Estándar Telcel (Sábana Radiográfica Radiocomunicación)',
    operator: 'TELCEL',
    description: 'Estructura estándar de desglose de llamadas y datos de Radiomóvil Dipsa, S.A. de C.V. solicitada por mandamiento ministerial.',
    expectedHeaders: [
      'NUMERO_ORIGEN', 'NUMERO_DESTINO', 'FECHA_HORA', 'DURACION_SEG', 'TIPO_LLAMADA',
      'IMEI', 'IMSI', 'CGI_ORIGEN', 'NOMBRE_SITIO', 'LATITUD', 'LONGITUD', 'AZIMUT', 'TECNOLOGIA'
    ],
    sampleRow: {
      'NUMERO_ORIGEN': '6567892041',
      'NUMERO_DESTINO': '6564893321',
      'FECHA_HORA': '2024-10-14 18:42:15',
      'DURACION_SEG': '184',
      'TIPO_LLAMADA': 'VOZ_SALIENTE',
      'IMEI': '863920048123456',
      'IMSI': '334020194857201',
      'CGI_ORIGEN': '334-020-4120-10881',
      'NOMBRE_SITIO': 'Torre Pronaf - Av. Lincoln',
      'LATITUD': '31.7380',
      'LONGITUD': '-106.4420',
      'AZIMUT': '45',
      'TECNOLOGIA': '4G_LTE'
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  },
  {
    id: 'FMT-ATT',
    name: 'Formato Judicial AT&T Comunicaciones Digitales',
    operator: 'AT&T',
    description: 'Reporte forense expedido por el área de Requerimientos Legales y Autoridades Judiciales de AT&T México.',
    expectedHeaders: [
      'MSISDN_A', 'MSISDN_B', 'START_TIME', 'DURATION', 'CALL_TYPE',
      'DEVICE_IMEI', 'SIM_IMSI', 'CELL_ID', 'SITE_LABEL', 'COORDINATES_LAT', 'COORDINATES_LONG', 'ANTENNA_AZIMUTH', 'SERVICE_BAND'
    ],
    sampleRow: {
      'MSISDN_A': '6563129988',
      'MSISDN_B': '6567892041',
      'START_TIME': '2024-10-14 19:15:30',
      'DURATION': '95',
      'CALL_TYPE': 'VOZ_SALIENTE',
      'DEVICE_IMEI': '359128094726154',
      'SIM_IMSI': '334050982341255',
      'CELL_ID': 'CJZ-2044-S1',
      'SITE_LABEL': 'Torre Anapra - Cerros de Anapra',
      'COORDINATES_LAT': '31.7850',
      'COORDINATES_LONG': '-106.5410',
      'ANTENNA_AZIMUTH': '210',
      'SERVICE_BAND': 'LTE_B4'
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  },
  {
    id: 'FMT-MOVISTAR',
    name: 'Formato Telefónica Movistar / Geomatrix Standard Export',
    operator: 'MOVISTAR',
    description: 'Exportación normalizada de registros de tráfico de red Telefónica México / Plataforma de geolocalización Geomatrix.',
    expectedHeaders: [
      'TEL_ORIGINANTE', 'TEL_TERMINANTE', 'TIMESTAMP_INICIO', 'SEGUNDOS', 'EVENTO',
      'NUM_IMEI', 'NUM_IMSI', 'ID_ESTACION_BASE', 'DIRECCION_ANTENA', 'LAT', 'LNG', 'SECTOR_AZIMUT', 'RED_ACCESO'
    ],
    sampleRow: {
      'TEL_ORIGINANTE': '6567892041',
      'TEL_TERMINANTE': '6569913344',
      'TIMESTAMP_INICIO': '2024-10-14 20:30:10',
      'SEGUNDOS': '310',
      'EVENTO': 'VOZ_SALIENTE',
      'NUM_IMEI': '863920048123456',
      'NUM_IMSI': '334020194857201',
      'ID_ESTACION_BASE': 'CJZ-5012',
      'DIRECCION_ANTENA': 'Torre Zaragoza - Carretera Juárez-Porvenir',
      'LAT': '31.6380',
      'LNG': '-106.3240',
      'SECTOR_AZIMUT': '180',
      'RED_ACCESO': '3G_HSPA'
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  }
];

// Generador de registros sintéticos fidedignos para Ciudad Juárez
export function generateSyntheticRecords(caseId: string = 'CASE-2024-0891'): CallDetailRecord[] {
  const records: CallDetailRecord[] = [];
  const primarySuspect = '656-789-2041';
  const secondarySuspect = '656-312-9988';
  const victimPhone = '656-554-1122';
  const victimDad = '656-489-3321';
  const victimMom = '656-209-4455';
  const dealerPhone = '656-991-3344';
  const didiPhone = '656-654-0011';
  const auntPhone = '656-890-7766';
  const convenienceStore = '656-112-8877';

  // Secuencia de eventos cronológicos del caso
  const eventsTimeline = [
    // Día 1: 14 Octubre 2024 - Previo y Levantón
    { date: '2024-10-14', time: '14:15:20', duration: 140, a: primarySuspect, b: secondarySuspect, towerIndex: 0, type: 'VOZ_SALIENTE' as const, note: 'Coordinación previa' },
    { date: '2024-10-14', time: '15:30:00', duration: 45, a: didiPhone, b: victimPhone, towerIndex: 0, type: 'VOZ_SALIENTE' as const, note: 'Llegada de servicio transporte' },
    { date: '2024-10-14', time: '16:10:44', duration: 0, a: victimPhone, b: victimMom, towerIndex: 0, type: 'SMS_SALIENTE' as const, note: 'Mensaje rutinario de la víctima' },
    { date: '2024-10-14', time: '17:45:10', duration: 85, a: secondarySuspect, b: primarySuspect, towerIndex: 3, type: 'VOZ_SALIENTE' as const, note: 'Confirmación visual' },
    { date: '2024-10-14', time: '18:42:15', duration: 184, a: primarySuspect, b: victimDad, towerIndex: 0, type: 'VOZ_SALIENTE' as const, note: '1ª Llamada de Exigencia de Rescate' },
    { date: '2024-10-14', time: '19:15:30', duration: 95, a: secondarySuspect, b: primarySuspect, towerIndex: 2, type: 'VOZ_SALIENTE' as const, note: 'Desplazamiento a Anapra' },
    { date: '2024-10-14', time: '19:40:12', duration: 320, a: primarySuspect, b: dealerPhone, towerIndex: 2, type: 'VOZ_SALIENTE' as const, note: 'Contacto con apoyo en casa de seguridad' },
    { date: '2024-10-14', time: '20:30:10', duration: 310, a: primarySuspect, b: victimDad, towerIndex: 5, type: 'VOZ_SALIENTE' as const, note: '2ª Llamada extorsiva (Zaragoza)' },
    { date: '2024-10-14', time: '21:14:00', duration: 0, a: primarySuspect, b: victimDad, towerIndex: 5, type: 'SMS_SALIENTE' as const, note: 'SMS con número de cuenta para anticipo' },
    { date: '2024-10-14', time: '22:05:55', duration: 60, a: primarySuspect, b: convenienceStore, towerIndex: 6, type: 'VOZ_SALIENTE' as const, note: 'Recarga telefónica en Praderas del Sol' },
    { date: '2024-10-14', time: '23:40:18', duration: 420, a: secondarySuspect, b: primarySuspect, towerIndex: 6, type: 'VOZ_SALIENTE' as const, note: 'Vigilancia nocturna' },

    // Día 2: 15 Octubre 2024 - Negociación y Movilidad
    { date: '2024-10-15', time: '08:10:05', duration: 240, a: primarySuspect, b: victimDad, towerIndex: 6, type: 'VOZ_SALIENTE' as const, note: '3ª Llamada de ultimátum' },
    { date: '2024-10-15', time: '09:30:12', duration: 110, a: victimDad, b: auntPhone, towerIndex: 0, type: 'VOZ_SALIENTE' as const, note: 'Búsqueda de fondos familiares' },
    { date: '2024-10-15', time: '11:15:40', duration: 195, a: primarySuspect, b: secondarySuspect, towerIndex: 4, type: 'VOZ_SALIENTE' as const, note: 'Traspaso por Las Misiones' },
    { date: '2024-10-15', time: '13:00:22', duration: 520, a: primarySuspect, b: dealerPhone, towerIndex: 8, type: 'VOZ_SALIENTE' as const, note: 'Punto de reunión en Sendero' },
    { date: '2024-10-15', time: '14:45:10', duration: 180, a: secondarySuspect, b: primarySuspect, towerIndex: 7, type: 'VOZ_SALIENTE' as const, note: 'Paso por Aeropuerto' },
    { date: '2024-10-15', time: '16:20:30', duration: 290, a: primarySuspect, b: victimDad, towerIndex: 9, type: 'VOZ_SALIENTE' as const, note: '4ª Llamada - Instrucciones de entrega' },
    { date: '2024-10-15', time: '18:10:15', duration: 0, a: primarySuspect, b: victimDad, towerIndex: 9, type: 'SMS_SALIENTE' as const, note: 'Ubicación de bolsa en puente' },
    { date: '2024-10-15', time: '19:55:00', duration: 610, a: primarySuspect, b: secondarySuspect, towerIndex: 1, type: 'VOZ_SALIENTE' as const, note: 'Regreso hacia zona Centro' },
    { date: '2024-10-15', time: '21:30:45', duration: 150, a: primarySuspect, b: dealerPhone, towerIndex: 2, type: 'VOZ_SALIENTE' as const, note: 'Refugio en Anapra' },

    // Día 3: 16 Octubre 2024 - Tensión y Cierre
    { date: '2024-10-16', time: '07:45:20', duration: 180, a: primarySuspect, b: secondarySuspect, towerIndex: 2, type: 'VOZ_SALIENTE' as const, note: 'Revisión matutina' },
    { date: '2024-10-16', time: '10:12:30', duration: 340, a: primarySuspect, b: victimDad, towerIndex: 3, type: 'VOZ_SALIENTE' as const, note: '5ª Llamada extorsiva (Gómez Morín)' },
    { date: '2024-10-16', time: '12:05:10', duration: 90, a: secondarySuspect, b: didiPhone, towerIndex: 3, type: 'VOZ_SALIENTE' as const, note: 'Solicitud de escape' },
    { date: '2024-10-16', time: '14:22:45', duration: 75, a: primarySuspect, b: convenienceStore, towerIndex: 11, type: 'VOZ_SALIENTE' as const, note: 'Sector Parque Industrial' },
    { date: '2024-10-16', time: '16:00:10', duration: 480, a: primarySuspect, b: dealerPhone, towerIndex: 10, type: 'VOZ_SALIENTE' as const, note: 'Operativo en Riberas del Bravo' },
    { date: '2024-10-16', time: '17:30:00', duration: 120, a: secondarySuspect, b: primarySuspect, towerIndex: 10, type: 'VOZ_SALIENTE' as const, note: 'Alerta de presencia policial' },
    { date: '2024-10-16', time: '18:45:10', duration: 40, a: primarySuspect, b: victimDad, towerIndex: 10, type: 'VOZ_SALIENTE' as const, note: 'Última llamada registrada previa al rescate' }
  ];

  let recordCounter = 1;

  // Expandimos los eventos principales con tráfico de fondo normal (llamadas y datos LTE) para recrear una sábana forense de 150+ registros interactivos
  eventsTimeline.forEach((ev, idx) => {
    const tower = MOCK_TOWERS[ev.towerIndex] || MOCK_TOWERS[0];
    const timestamp = new Date(`${ev.date}T${ev.time}`).getTime();

    // Registro del evento principal
    records.push({
      id: `CDR-${String(recordCounter++).padStart(5, '0')}`,
      caseId,
      targetPhone: primarySuspect,
      numberA: ev.a,
      numberB: ev.b,
      eventType: ev.type,
      date: ev.date,
      time: ev.time,
      timestamp,
      durationSeconds: ev.duration,
      imei: '863920048123456',
      imsi: '334020194857201',
      towerId: tower.id,
      towerName: tower.name,
      latitude: tower.latitude + (Math.random() - 0.5) * 0.003,
      longitude: tower.longitude + (Math.random() - 0.5) * 0.003,
      azimuth: tower.azimuth,
      networkType: '4G_LTE',
      status: ev.duration > 0 ? 'COMPLETADA' : 'NO_CONTESTADA',
      operator: tower.operator,
      isRoaming: false,
      colorTag: ev.note.includes('Rescate') || ev.note.includes('Exigencia') ? '#EF4444' : '#3B82F6',
      notes: ev.note
    });

    // Inyectamos 4 registros de tráfico de fondo (conexiones de datos y mensajes de red) alrededor del evento
    for (let j = 1; j <= 4; j++) {
      const offsetMin = j * 12;
      const fakeTime = new Date(timestamp + offsetMin * 60000);
      const fakeTimeStr = fakeTime.toTimeString().split(' ')[0];
      const isVoice = j % 2 === 0;
      const destNumber = j === 1 ? dealerPhone : (j === 2 ? secondarySuspect : (j === 3 ? convenienceStore : '656-500-' + (1000 + j * 123)));

      records.push({
        id: `CDR-${String(recordCounter++).padStart(5, '0')}`,
        caseId,
        targetPhone: primarySuspect,
        numberA: j === 2 ? destNumber : primarySuspect,
        numberB: j === 2 ? primarySuspect : destNumber,
        eventType: isVoice ? (j === 2 ? 'VOZ_ENTRANTE' : 'VOZ_SALIENTE') : 'DATOS_LTE',
        date: ev.date,
        time: fakeTimeStr,
        timestamp: fakeTime.getTime(),
        durationSeconds: isVoice ? Math.floor(Math.random() * 250) + 15 : 0,
        imei: '863920048123456',
        imsi: '334020194857201',
        towerId: tower.id,
        towerName: tower.name,
        latitude: tower.latitude + (Math.random() - 0.5) * 0.004,
        longitude: tower.longitude + (Math.random() - 0.5) * 0.004,
        azimuth: (tower.azimuth + (j * 40)) % 360,
        networkType: '4G_LTE',
        status: 'COMPLETADA',
        operator: tower.operator,
        isRoaming: false,
        notes: isVoice ? 'Comunicación colateral' : 'Sesión de paquetes de datos de red IP'
      });
    }
  });

  // Ordenar cronológicamente
  return records.sort((a, b) => a.timestamp - b.timestamp);
}
