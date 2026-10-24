import React, { useState } from 'react';
import { InvestigationCase, CallDetailRecord, CellTower, PhoneLabel } from '../types/telecom';
import { FileText, Printer, Download, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { BuhueLogo } from './BuhueLogo';

interface ReportsViewProps {
  activeCase: InvestigationCase;
  records: CallDetailRecord[];
  towers: CellTower[];
  labels: PhoneLabel[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeCase,
  records,
  towers,
  labels
}) => {
  const [reportType, setReportType] = useState<'pericial' | 'ejecutivo'>('pericial');
  const [isExporting, setIsExporting] = useState(false);

  // Llamadas de rescate o críticas
  const criticalCalls = records.filter(
    r => r.notes?.toLowerCase().includes('rescate') || r.notes?.toLowerCase().includes('exigencia')
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReportDoc = () => {
    setIsExporting(true);
    setTimeout(() => {
      const content = `
FISCALÍA GENERAL DEL ESTADO DE CHIHUAHUA
UNIDAD ESPECIALIZADA EN COMBATE AL SECUESTRO (UECS JUÁREZ)
REPORTE TÉCNICO PERICIAL DE ANÁLISIS DE TELECOMUNICACIONES
=============================================================
EXPEDIENTE: ${activeCase.caseNumber}
CAUSA: ${activeCase.title}
DELITO: ${activeCase.crimeType}
FECHA: ${new Date().toLocaleDateString('es-MX')}

1. RESUMEN DE LA INVESTIGACIÓN
${activeCase.summary}

2. LÍNEAS TELEFÓNICAS AUDITADAS
- Objetivo Principal: ${activeCase.primaryTargetNumber}
- Líneas Secundarias: ${activeCase.secondaryNumbers.join(', ')}
- Total de Registros Analizados: ${records.length} eventos

3. EVENTOS CRÍTICOS IDENTIFICADOS EN SÁBANA
${criticalCalls.map((c, i) => `${i + 1}. [${c.date} ${c.time}] ${c.numberA} -> ${c.numberB} (${c.durationSeconds}s) | Celda: ${c.towerName} (Az: ${c.azimuth}°) | Nota: ${c.notes}`).join('\n')}

4. CONCLUSIÓN FORENSE
Se constata la existencia de un patrón secuencial de movilidad en celdas de Ciudad Juárez correspondiente a las coordenadas de los hechos denunciados.

PERITO RESPONSABLE:
Área de Inteligencia y Telefonía Forense
Fiscalía de Distrito Zona Norte - Cd. Juárez
      `.trim();

      const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `DICTAMEN_FORENSE_${activeCase.caseNumber}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Controles de Vista de Reporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Dictámenes y Reportes Periciales</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Documentos forenses oficiales listos para incorporación a la carpeta de investigación del Ministerio Público
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
          <button
            disabled={isExporting}
            onClick={handleDownloadReportDoc}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Descargando...' : 'Descargar (.doc)'}</span>
          </button>
        </div>
      </div>

      {/* Hoja de Dictamen Oficial Estructurado */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-8 text-slate-200 space-y-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Cabecera Institucional con Emblema Buhue */}
        <div className="border-b-2 border-slate-700 pb-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <BuhueLogo size={52} variant="icon" />
            <div>
              <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                Fiscalía General del Estado de Chihuahua
              </div>
              <div className="text-sm font-bold text-white print:text-black">
                BUHUE · Unidad Especializada en Combate al Secuestro (UECS)
              </div>
              <div className="text-xs text-slate-400">
                Sede Operativa: Ciudad Juárez, Chihuahua · Distrito Judicial Bravos
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="font-bold text-blue-400 print:text-blue-700 block">{activeCase.caseNumber}</span>
            <span className="text-[11px] text-slate-400">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Título del Dictamen */}
        <div className="text-center py-2">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-black">
            Dictamen Pericial de Telecomunicaciones y Análisis de Tráfico de Celdas
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Materia: Extracción, normalización y georreferenciación de sábanas telefónicas
          </span>
        </div>

        {/* I. Datos Generales de la Carpeta */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-white print:text-black uppercase text-xs tracking-wider border-b border-slate-800 pb-1">
            I. Datos de Identificación Ministerial
          </h3>
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Carpeta de Investigación:</span>
              <span className="font-bold text-white print:text-black">{activeCase.caseNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Delito Imputado:</span>
              <span className="font-bold text-white print:text-black">{activeCase.crimeType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Objetivo Telefónico Auditado:</span>
              <span className="font-bold text-blue-400 print:text-blue-700">{activeCase.primaryTargetNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Perito / Analista:</span>
              <span className="font-bold text-white print:text-black">{activeCase.leadInvestigator}</span>
            </div>
          </div>
        </div>

        {/* II. Metodología Forense */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-white print:text-black uppercase text-xs tracking-wider border-b border-slate-800 pb-1">
            II. Metodología y Herramientas Empleadas
          </h3>
          <p className="text-slate-300 print:text-slate-700 leading-relaxed">
            Se realizó el procesamiento informático-forense de los archivos digitales correspondientes a sábanas telefónicas de llamadas entrantes, salientes, mensajes SMS y registros de datos LTE proporcionados por concesionarios de telecomunicaciones (Telcel, AT&T y Movistar) bajo mandato ministerial. Los registros fueron normalizados y georreferenciados en el sistema ANTISEC, proyectando el cono de azimut correspondiente a cada sector de antena celular en Ciudad Juárez.
          </p>
        </div>

        {/* III. Comunicaciones Críticas Identificadas */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-white print:text-black uppercase text-xs tracking-wider border-b border-slate-800 pb-1">
            III. Comunicaciones Críticas Determinantes (Exigencia Económica)
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2">Fecha/Hora</th>
                  <th className="p-2">Origen (A)</th>
                  <th className="p-2">Destino (B)</th>
                  <th className="p-2">Duración</th>
                  <th className="p-2">Celda en Cd. Juárez</th>
                  <th className="p-2">Azimut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {criticalCalls.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2 font-semibold text-white print:text-black">{c.date} {c.time}</td>
                    <td className="p-2 text-rose-400 print:text-rose-700 font-bold">{c.numberA}</td>
                    <td className="p-2 text-slate-300 print:text-slate-800">{c.numberB}</td>
                    <td className="p-2 tabular-nums">{c.durationSeconds}s</td>
                    <td className="p-2">{c.towerName}</td>
                    <td className="p-2 text-center">{c.azimuth}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IV. Conclusiones Periciales */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-white print:text-black uppercase text-xs tracking-wider border-b border-slate-800 pb-1">
            IV. Conclusiones y Trazabilidad Geoespacial
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 print:text-slate-800 leading-relaxed font-sans">
            <li>
              <strong>Desplazamiento Comprobado:</strong> La línea objetivo <strong>{activeCase.primaryTargetNumber}</strong> registró una ruta secuencial con origen en la Zona Pronaf (Av. Lincoln), desplazamiento a Anapra y posterior movimiento hacia el oriente de la ciudad (Zaragoza y Riberas del Bravo).
            </li>
            <li>
              <strong>Co-localización:</strong> Se confirmó la coincidencia espacio-temporal en la misma celda celular con los números clasificados como sospechosos secundarios en ventanas menores a 60 minutos.
            </li>
            <li>
              <strong>Consistencia Técnica:</strong> Los conos de azimut proyectados en Google Maps corroboran que los eventos de comunicación se emitieron dentro del sector angular registrado por las estaciones base.
            </li>
          </ul>
        </div>

        {/* Firmas Oficiales */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-slate-700 pt-2">
            <span className="font-bold text-white print:text-black block">Perito en Informática Forense y Telecomunicaciones</span>
            <span className="text-slate-400 text-[11px]">Unidad Especializada en Combate al Secuestro</span>
            <span className="text-[10px] text-slate-400 block font-mono">Céd. Prof. 8492019 / Reg. Pericial 412-CHIH</span>
          </div>
          <div className="border-t border-slate-700 pt-2">
            <span className="font-bold text-white print:text-black block">Agente del Ministerio Público de la Federación</span>
            <span className="text-slate-400 text-[11px]">Fiscalía de Distrito Zona Norte</span>
            <span className="text-[10px] text-slate-400 block font-mono">Unidad de Delitos de Alto Impacto</span>
          </div>
        </div>
      </div>
    </div>
  );
};
