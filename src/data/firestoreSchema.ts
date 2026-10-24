/**
 * ESQUEMA DE ARQUITECTURA FIRESTORE Y PLAN PARA 1,000,000 DE REGISTROS
 * ANTISEC | Análisis Telefónico - UECS Ciudad Juárez
 */

export interface FirestoreCollectionSpec {
  collectionName: string;
  path: string;
  description: string;
  keyFields: string[];
  partitionStrategy: string;
  readPattern: string;
  writePattern: string;
  securityRuleSummary: string;
  sampleDocument: Record<string, unknown>;
}

export const FIRESTORE_SCHEMA: FirestoreCollectionSpec[] = [
  {
    collectionName: 'cases',
    path: '/cases/{caseId}',
    description: 'Expedientes y carpetas de investigación judicial de la fiscalía.',
    keyFields: ['caseNumber', 'title', 'crimeType', 'status', 'leadInvestigator', 'primaryTargetNumber', 'totalRecordsCount'],
    partitionStrategy: 'Clave única por caso ministerial EXP-CJ-YYYY-NNNN.',
    readPattern: 'Lectura frecuente por analistas asignados a la carpeta.',
    writePattern: 'Escritura controlada en creación y actualización de estado.',
    securityRuleSummary: 'Solo personal con rol ministerial/analista UECS autenticado.',
    sampleDocument: {
      caseNumber: 'EXP-CJ-2024-0891',
      title: 'Secuestro Agravado Empresario Zona Pronaf',
      crimeType: 'Secuestro Agravado',
      status: 'ACTIVO',
      leadInvestigator: 'Cmdte. R. Valenzuela',
      primaryTargetNumber: '656-789-2041',
      secondaryNumbers: ['656-312-9988', '656-554-1122'],
      totalRecordsCount: 1420,
      createdAt: '2024-10-14T10:00:00Z',
      updatedAt: '2024-10-24T12:00:00Z'
    }
  },
  {
    collectionName: 'phone_labels',
    path: '/cases/{caseId}/phone_labels/{phoneNumber}',
    description: 'Etiquetado manual de números telefónicos por caso e investigado (ej. papá, mamá, tía, dealer, sospechoso, didi).',
    keyFields: ['phoneNumber', 'label', 'category', 'color', 'notes', 'associatedSuspect', 'updatedBy'],
    partitionStrategy: 'Subcolección por caso con ID de documento = número telefónico normalizado a 10 dígitos.',
    readPattern: 'Lectura en caché local del caso (100 a 5,000 etiquetas por caso).',
    writePattern: 'Escrituras individuales cuando el analista etiqueta un número en el explorador o mapa.',
    securityRuleSummary: 'Escritura y lectura permitida a analistas asignados al caso.',
    sampleDocument: {
      phoneNumber: '6567892041',
      label: 'Sospechoso 1 / Celular Negociador',
      category: 'sospechoso',
      color: '#EF4444',
      notes: 'Llamadas de exigencia económica directas',
      associatedSuspect: 'Alias El Cuervo',
      updatedAt: '2024-10-18T14:22:00Z',
      updatedBy: 'analista.mendez@fiscalia.chihuahua.gob.mx'
    }
  },
  {
    collectionName: 'cell_towers',
    path: '/cell_towers/{towerId}',
    description: 'Catálogo geoespacial maestro de torres y celdas de radiocomunicación en Ciudad Juárez.',
    keyFields: ['towerId', 'name', 'operator', 'latitude', 'longitude', 'azimuth', 'beamWidth', 'lac', 'cellId'],
    partitionStrategy: 'ID de estación base o Cell Global Identity (MCC-MNC-LAC-CI).',
    readPattern: 'Caché estática de consulta geoespacial en cliente para renderizar polígonos de azimut en Google Maps.',
    writePattern: 'Solo administradores de sistemas y peritos cartógrafos.',
    securityRuleSummary: 'Lectura pública/restringida institucional; escritura admin.',
    sampleDocument: {
      towerId: 'CJZ-1088',
      name: 'Torre Pronaf - Av. Lincoln',
      operator: 'TELCEL',
      latitude: 31.7380,
      longitude: -106.4420,
      azimuth: 45,
      beamWidth: 65,
      rangeMeters: 1400,
      address: 'Av. Abraham Lincoln s/n, Zona Pronaf, Cd Juárez, Chih.',
      lac: 4120,
      cellId: 10881
    }
  },
  {
    collectionName: 'records_partitions (Arquitectura 1M)',
    path: '/cases/{caseId}/daily_batches/{date}/records/{recordId}',
    description: 'Registros individuales de sábanas telefónicas particionados por fecha para soportar hasta 1,000,000 de llamadas.',
    keyFields: ['numberA', 'numberB', 'eventType', 'timestamp', 'durationSeconds', 'towerId', 'azimuth', 'imei'],
    partitionStrategy: 'Particionado diario + BigQuery/Cloud Storage para ingesta masiva de sábanas completas.',
    readPattern: 'Consultas acotadas por ventana de tiempo y número telefónico con índices compuestos.',
    writePattern: 'Carga masiva en chunks de 500 registros vía Firestore Batch Writes o Cloud Functions en segundo plano.',
    securityRuleSummary: 'Estrictamente accesible solo por peritos autorizados.',
    sampleDocument: {
      recordId: 'CDR-00042',
      numberA: '6567892041',
      numberB: '6564893321',
      eventType: 'VOZ_SALIENTE',
      timestamp: 1728931335000,
      durationSeconds: 184,
      imei: '863920048123456',
      towerId: 'CJZ-1088',
      azimuth: 45
    }
  }
];

export const PENDING_ARCHITECTURAL_DECISIONS = [
  {
    id: 1,
    topic: 'Columnas exactas de los 3 formatos de sábanas',
    status: 'EN EVALUACIÓN',
    impact: 'Define el parser final en el backend para Telcel, AT&T y Movistar. La etapa 1 ya incluye mapeadores modulares configurables.',
    question: '¿Las sábanas entregadas por Telcel, AT&T y Movistar siguen el formato oficial con encabezados fijos o varían por juzgado/oficio ministerial?'
  },
  {
    id: 2,
    topic: 'Volumen objetivo de 1.000.000 de registros: ¿Archivo, expediente o total?',
    status: 'EN EVALUACIÓN',
    impact: 'Si es por archivo individual (1 archivo = 1M filas), se requiere pipeline asíncrono con Cloud Run + Cloud Storage + Parquet. Si es por expediente, partición en Firestore.',
    question: '¿El millón de registros corresponde a una sola sábana masiva, al acumulado de un expediente o al total histórico del sistema?'
  },
  {
    id: 3,
    topic: 'Documentación oficial de Geomatrix',
    status: 'PENDIENTE',
    impact: 'Integración de coordenadas y polígonos oficiales de antenas de Ciudad Juárez sin inventar endpoints ni violar restricciones OSINT.',
    question: '¿Se cuenta con acceso a la exportación oficial de catálogo de celdas de Geomatrix o se continuará con importación de archivos CSV de antenas?'
  },
  {
    id: 4,
    topic: 'Disponibilidad de Azimut, Celda, Operador y Tipo de Evento en todas las sábanas',
    status: 'CONFIRMADO PARCIAL',
    impact: 'En algunas sábanas de SMS o datos, los operadores omiten el azimut o registran azimut 999/nulo. Se requiere algoritmo de tolerancia.',
    question: '¿Cómo debe actuar el trazado en el mapa cuando el operador reporta azimut nulo o 999 (omnidireccional)?'
  },
  {
    id: 5,
    topic: 'Infraestructura y presupuesto para procesamiento masivo',
    status: 'POR AUTORIZAR',
    impact: 'No se deben instanciar workers facturables en la nube sin orden previa. En esta Etapa 1 se procesa en cliente y memoria virtual.',
    question: '¿Qué nivel de cuota de Cloud Functions / Cloud Run está autorizado para ingestas pesadas de PDFs de 500+ páginas?'
  },
  {
    id: 6,
    topic: 'Confirmación de uso de Google Maps API y costos',
    status: 'CONFIGURADA (CLAVE DE CLIENTE APLICADA)',
    impact: 'Se utilizó la clave autorizada en la interfaz y se configuró bajo los lineamientos oficiales de Google Maps Platform.',
    question: 'Se sugiere añadir restricciones de HTTP Referrer en la consola de Google Cloud para proteger la cuota de la API key.'
  },
  {
    id: 7,
    topic: 'Autorización para etiquetado manual en Firestore',
    status: 'PREPARADO EN ETAPA 1',
    impact: 'Etiquetas almacenadas localmente y preparadas para sincronización en Firestore collection /cases/{caseId}/phone_labels.',
    question: '¿Las etiquetas (papá, mamá, dealer, etc.) deben ser privadas por caso o compartidas entre diferentes carpetas de investigación?'
  }
];
