import React, { useState } from 'react';
import { OperatorFileFormatConfig } from '../types/telecom';
import { OPERATOR_FORMATS } from '../data/mockData';
import { 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Table, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ImportWizardViewProps {
  onImportComplete: (count: number) => void;
}

export const ImportWizardView: React.FC<ImportWizardViewProps> = ({ onImportComplete }) => {
  const [selectedFormat, setSelectedFormat] = useState<OperatorFileFormatConfig>(OPERATOR_FORMATS[0]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('SABANA_TELCEL_REQUERIMIENTO_MINISTERIAL_0891.xlsx');
  const [recordCountToSimulate, setRecordCountToSimulate] = useState<number>(1420);
  const [conversionType, setConversionType] = useState<'excel' | 'word'>('excel');
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      setCurrentStep(2);
    }
  };

  const handleProcessImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(4);
      onImportComplete(recordCountToSimulate);
    }, 1200);
  };

  // Conversión PDF a Excel (Generación y descarga de archivo .csv compatible con Excel)
  const handleDownloadExcelConversion = () => {
    setConversionStatus('Generando libro de trabajo normalizado en formato Excel...');
    setTimeout(() => {
      const headers = selectedFormat.expectedHeaders.join(',');
      const sampleRows = [
        '6567892041,6564893321,2024-10-14 18:42:15,184,VOZ_SALIENTE,863920048123456,334020194857201,334-020-4120-10881,Torre Pronaf - Av. Lincoln,31.7380,-106.4420,45,4G_LTE',
        '6563129988,6567892041,2024-10-14 19:15:30,95,VOZ_SALIENTE,359128094726154,334050982341255,334-050-5011-20441,Torre Anapra,31.7850,-106.5410,210,4G_LTE',
        '6567892041,6569913344,2024-10-14 19:40:12,320,VOZ_SALIENTE,863920048123456,334020194857201,334-020-4120-20441,Torre Anapra,31.7850,-106.5410,210,4G_LTE',
        '6567892041,6564893321,2024-10-14 20:30:10,310,VOZ_SALIENTE,863920048123456,334020194857201,334-030-6300-50121,Torre Zaragoza,31.6380,-106.3240,180,3G_HSPA'
      ].join('\n');

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + '\n' + sampleRows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SABANA_FORENSE_NORMALIZADA_${selectedFormat.operator}_CJZ.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setConversionStatus('✓ Conversión PDF a Excel completada exitosamente.');
    }, 800);
  };

  // Conversión PDF a Word (Generación y descarga de archivo de texto pericial para Word)
  const handleDownloadWordConversion = () => {
    setConversionStatus('Generando dictamen técnico para Microsoft Word...');
    setTimeout(() => {
      const docContent = `
FISCALÍA GENERAL DEL ESTADO DE CHIHUAHUA
UNIDAD ESPECIALIZADA EN COMBATE AL SECUESTRO (UECS - DISTRITO NORTE)
CIUDAD JUÁREZ, CHIH.

DICTAMEN TÉCNICO PERICIAL DE EXTRACCIÓN DE SÁBANA TELEFÓNICA
=============================================================
EXPEDIENTE: EXP-CJ-2024-0891
ASUNTO: Desglose y Normalización de Registros de Tráfico Celular
OPERADOR: ${selectedFormat.operator}
FECHA DE PROCESAMIENTO: ${new Date().toLocaleDateString('es-MX')}

I. ANTECEDENTES Y REQUERIMIENTO MINISTERIAL
En cumplimiento al oficio judicial girado por el agente del Ministerio Público, se procedió a la ingesta y extracción estructurada de las sábanas remitidas por la concesionaria de telecomunicaciones ${selectedFormat.operator}.

II. PARÁMETROS GEORREFERENCIADOS IDENTIFICADOS EN CIUDAD JUÁREZ
1. Celda Principal de Origen: Torre Pronaf - Av. Lincoln (Azimut 45°)
2. Celda de Desplazamiento 1: Torre Anapra (Azimut 210°)
3. Celda de Desplazamiento 2: Torre Zaragoza (Azimut 180°)
4. Celda de Cierre Operativo: Torre Riberas del Bravo (Azimut 150°)

III. RESUMEN DE NÚMEROS CRÍTICOS IDENTIFICADOS
- Teléfono Objetivo A: 656-789-2041 (Sospechoso Negociador)
- Teléfono Receptor B: 656-489-3321 (Papá / Denunciante)
- Total de eventos de comunicación detectados: 1,420
- Coincidencia espacio-temporal: Se confirma movilidad en línea de tiempo coincidente con los hechos.

ATENTAMENTE,
Área de Análisis Forense de Comunicaciones
Fiscalía General del Estado de Chihuahua
      `.trim();

      const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `DICTAMEN_FORENSE_SABANA_${selectedFormat.operator}_EXP0891.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setConversionStatus('✓ Dictamen generado y descargado para Microsoft Word.');
    }, 800);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Importación y Normalización de Sábanas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Asistente modular para sábanas de Telcel, AT&T y Movistar + herramientas de conversión PDF
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Filtro de integridad de columnas activo</span>
        </div>
      </div>

      {/* Herramienta Especial de Conversión: PDF → Excel y PDF → Word */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Convertidor Forense de Sábanas (PDF → Excel / PDF → Word)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Convierte sábanas PDF oficiales entregadas por juzgados a tablas de datos editables o dictámenes periciales
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800 shrink-0">
            <button
              onClick={() => setConversionType('excel')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded transition-colors ${
                conversionType === 'excel'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PDF → Excel (.csv)
            </button>
            <button
              onClick={() => setConversionType('word')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded transition-colors ${
                conversionType === 'word'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PDF → Word (.doc)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-2 text-xs">
            <p className="text-slate-300">
              {conversionType === 'excel' 
                ? 'Extrae filas tabulares de sábanas PDF escaneadas u oficiales y normaliza los encabezados a columnas estándar (Origen, Destino, Fecha, Hora, Celda, Azimut, IMEI).'
                : 'Genera un documento estructurado de informe técnico pericial para su integración física o digital al cuadernillo de la carpeta de investigación judicial.'}
            </p>
            {conversionStatus && (
              <div className="text-emerald-400 font-mono text-[11px] bg-emerald-950/40 border border-emerald-800/60 p-2 rounded">
                {conversionStatus}
              </div>
            )}
          </div>
          <div className="flex sm:justify-end">
            {conversionType === 'excel' ? (
              <button
                onClick={handleDownloadExcelConversion}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Ejecutar PDF → Excel</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadWordConversion}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Ejecutar PDF → Word</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pasos del Asistente Modular */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {[
          { step: 1, title: '1. Formato' },
          { step: 2, title: '2. Carga' },
          { step: 3, title: '3. Mapeo' },
          { step: 4, title: '4. Ingesta' }
        ].map((s) => (
          <div
            key={s.step}
            onClick={() => s.step < currentStep && setCurrentStep(s.step as any)}
            className={`p-2 sm:p-2.5 text-center rounded border transition-colors ${
              currentStep === s.step
                ? 'bg-blue-950 text-blue-200 border-blue-600 font-bold'
                : currentStep > s.step
                ? 'bg-slate-900 text-emerald-400 border-slate-700 cursor-pointer'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Contenido según el paso */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Paso 1: Seleccionar Formato del Operador</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cada compañía telefónica en México utiliza esquemas de columnas específicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OPERATOR_FORMATS.map((fmt) => {
              const isSelected = selectedFormat.id === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`p-4 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-white">{fmt.operator}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-400" />}
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200">{fmt.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {fmt.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    {fmt.expectedHeaders.length} campos reconocidos
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors"
            >
              <span>Continuar a Carga</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Paso 2: Cargar Archivo de Sábana</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Formato activo: <span className="font-semibold text-white">{selectedFormat.name}</span>
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-400 hover:text-white self-start sm:self-auto"
            >
              ← Cambiar operador
            </button>
          </div>

          {/* Zona de Drag & Drop simulada */}
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded p-5 sm:p-8 text-center bg-slate-950/60 transition-colors">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              Arrastra aquí el archivo de la sábana o haz clic para explorar
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Archivos aceptados: Excel (.xlsx, .xls), CSV (.csv), Texto delimitado (.txt) o PDF ministerial (.pdf)
            </p>

            <label className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded cursor-pointer transition-colors">
              <span>Seleccionar desde el equipo</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv,.txt,.pdf"
                onChange={handleSimulateUpload}
              />
            </label>
          </div>

          {/* Archivo de muestra pre-cargado */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-mono text-white font-medium break-all">{uploadedFileName}</span>
                <span className="text-slate-400 text-[11px] block">4.8 MB · 1,420 registros calculados</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors text-center shrink-0"
            >
              Mapear Columnas →
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Paso 3: Validación y Mapeo de Columnas</h2>
              <p className="text-xs text-slate-400">
                Verifique que cada columna del archivo corresponda a la propiedad forense adecuada
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-1 rounded self-start sm:self-auto shrink-0">
              100% Columnas Coincidentes
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Columna Detectada</th>
                  <th className="p-2.5">Mapeo del Sistema</th>
                  <th className="p-2.5">Muestra de Dato</th>
                  <th className="p-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                {selectedFormat.expectedHeaders.map((header) => (
                  <tr key={header} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-semibold text-white">{header}</td>
                    <td className="p-2.5 text-blue-400">
                      {header.toLowerCase().replace(/_/g, '.')}
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {selectedFormat.sampleRow[header] || '---'}
                    </td>
                    <td className="p-2.5 text-emerald-400">
                      ✓ Válido
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-800 gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs text-slate-400 hover:text-white text-center py-2 sm:py-0"
            >
              ← Regresar
            </button>
            <button
              disabled={isProcessing}
              onClick={handleProcessImport}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando registros...</span>
                </>
              ) : (
                <>
                  <span>Ingestar {recordCountToSimulate} Registros a la Carpeta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-950 border border-emerald-600 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Sábana Telefónica Ingestada con Éxito</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Se han normalizado y georreferenciado 1,420 eventos de telecomunicación correspondientes al expediente activo en Ciudad Juárez.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              Importar Otro Archivo
            </button>
            <button
              onClick={() => onImportComplete(1420)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Ir al Explorador Forense →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
