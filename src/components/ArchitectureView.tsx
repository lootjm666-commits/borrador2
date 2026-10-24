import React, { useState } from 'react';
import { FIRESTORE_SCHEMA, PENDING_ARCHITECTURAL_DECISIONS } from '../data/firestoreSchema';
import { Layers, Database, Cpu, HardDrive, ShieldCheck, HelpCircle, Code, Server, ArrowRight } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedSchemaIndex, setSelectedSchemaIndex] = useState(0);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">ARQUITECTURA DE DATOS · ESCALA HASTA 1,000,000 DE REGISTROS</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Esquema Firestore y Pipeline de Procesamiento Asíncrono
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Especificación técnica de colecciones, reglas de particionado para grandes volúmenes y decisiones de diseño
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Etapa 1: Prototipo Funcional</span>
        </div>
      </div>

      {/* Diagrama de Pipeline de Datos (1.000.000 de Registros) */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Pipeline Asíncrono Propuesto para Procesamiento de Sábanas Masivas</span>
        </h2>
        <p className="text-xs text-slate-400">
          Para garantizar tiempos de respuesta sub-segundo en visualizaciones de mapas y tablas con 1M de filas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 relative">
            <span className="text-[10px] text-blue-400 font-bold block mb-1">01. INGESTA / CHUNKING</span>
            <h3 className="font-bold text-white text-xs mb-1">Sábanas Masivas</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Archivos Excel/PDF de hasta 100MB recibidos de Telcel, AT&T o Movistar vía mandamiento judicial.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 relative">
            <span className="text-[10px] text-blue-400 font-bold block mb-1">02. WORKER EN 2º PLANO</span>
            <h3 className="font-bold text-white text-xs mb-1">Procesador Node / Cloud Run</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Extracción streaming con memoria acotada (&lt;512MB RAM), validación de hash forense e inserción batch.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 relative">
            <span className="text-[10px] text-blue-400 font-bold block mb-1">03. ALMACENAMIENTO HÍBRIDO</span>
            <h3 className="font-bold text-white text-xs mb-1">Firestore + Particiones</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Metadatos, etiquetas y resúmenes en Firestore; índices espaciales y trazado de rutas con caché local.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 relative">
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">04. VISOR EN CLIENTE</span>
            <h3 className="font-bold text-white text-xs mb-1">Google Maps + Virtual Grid</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Renderizado reactivo con ventanas móviles de tiempo y agregación de conexiones por azimut en Juárez.
            </p>
          </div>
        </div>
      </div>

      {/* Explorador de Colecciones Firestore */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selector de Colecciones */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block px-1">
            Colecciones Firestore Definidas
          </span>
          {FIRESTORE_SCHEMA.map((schema, idx) => {
            const isSelected = selectedSchemaIndex === idx;
            return (
              <div
                key={schema.collectionName}
                onClick={() => setSelectedSchemaIndex(idx)}
                className={`p-3.5 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="font-mono text-xs font-bold text-white">{schema.collectionName}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">{schema.path}</p>
              </div>
            );
          })}
        </div>

        {/* Detalle Técnico de la Colección Seleccionada */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          {(() => {
            const current = FIRESTORE_SCHEMA[selectedSchemaIndex];
            return (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                      Colección Firestore
                    </span>
                    <h2 className="text-base font-bold text-white font-mono">{current.collectionName}</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {current.path}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block font-mono">Descripción Funcional</span>
                    <p className="text-slate-200 mt-0.5">{current.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Estrategia de Particionado</span>
                      <p className="text-slate-200 mt-0.5 text-[11px]">{current.partitionStrategy}</p>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Reglas de Seguridad</span>
                      <p className="text-slate-200 mt-0.5 text-[11px]">{current.securityRuleSummary}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block font-mono mb-1.5">
                      Campos de Búsqueda e Indexación
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {current.keyFields.map(f => (
                        <span key={f} className="bg-slate-950 text-blue-300 border border-slate-800 px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block font-mono mb-1">
                      Ejemplo de Documento JSON en Firestore
                    </span>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(current.sampleDocument, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Sección de Decisiones Pendientes Identificadas */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Decisiones Pendientes para las Siguientes Etapas</span>
            </h2>
            <p className="text-xs text-slate-400">
              Puntos técnicos clave que no bloquean esta primera entrega pero definirán la fase de integración masiva
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
            7 Decisiones Registradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {PENDING_ARCHITECTURAL_DECISIONS.map((d) => (
            <div key={d.id} className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-blue-400 font-bold text-[11px]">
                  Decisión #{d.id}: {d.topic}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  d.status.includes('CONFIGURADA') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  d.status.includes('PREPARADO') ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {d.status}
                </span>
              </div>
              <p className="text-slate-300 font-medium">{d.question}</p>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <strong>Impacto:</strong> {d.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
