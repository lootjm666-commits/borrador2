/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vista institucional de Resultados de los Dictámenes Periciales en PDF:
 * - 6271218386_finalizado_5a1987e7.pdf (Red de Vínculos UAYC)
 * - 6271218386_infomraci_n_extra_da_I2_d8519f17.pdf (Extracción IBM i2 Analyst's Notebook)
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Network, 
  Radio, 
  ExternalLink, 
  Download, 
  Search, 
  PhoneCall, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MessageSquare,
  HelpCircle,
  Eye,
  Calendar,
  Smartphone
} from 'lucide-react';
import { 
  PDF_DOCUMENTS, 
  PRIMARY_TARGET, 
  PDF_LINK_NODES, 
  PDF_DATA_SESSIONS_SAMPLE, 
  FORENSIC_INSIGHTS, 
  PdfLinkNode, 
  PdfCommunicationEvent 
} from '../data/pdfExtractedData';
import { BuhueLogo } from './BuhueLogo';

interface PdfAnalysisResultsViewProps {
  onNavigateToNumberAnalysis?: (phone: string) => void;
  onNavigateToMap?: (phone: string) => void;
}

export const PdfAnalysisResultsView: React.FC<PdfAnalysisResultsViewProps> = ({
  onNavigateToNumberAnalysis,
  onNavigateToMap
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grafo' | 'matriz' | 'datos_lte' | 'visor_pdf'>('grafo');
  const [selectedNodeNumber, setSelectedNodeNumber] = useState<string>(PDF_LINK_NODES[0].number);
  const [activePdfDocId, setActivePdfDocId] = useState<string>(PDF_DOCUMENTS[0].id);
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedNode = useMemo(() => {
    return PDF_LINK_NODES.find(n => n.number === selectedNodeNumber) || PDF_LINK_NODES[0];
  }, [selectedNodeNumber]);

  const activePdfDoc = useMemo(() => {
    return PDF_DOCUMENTS.find(d => d.id === activePdfDocId) || PDF_DOCUMENTS[0];
  }, [activePdfDocId]);

  // Consolidar todos los eventos para la matriz completa
  const allEvents = useMemo(() => {
    const events: PdfCommunicationEvent[] = [];
    PDF_LINK_NODES.forEach(node => {
      events.push(...node.events);
    });
    return events.sort((a, b) => {
      // Ordenamiento cronológico aproximado por fecha y hora
      const dateA = a.date.split('/').reverse().join('-') + ' ' + a.time;
      const dateB = b.date.split('/').reverse().join('-') + ' ' + b.time;
      return dateA.localeCompare(dateB);
    });
  }, []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      if (filterType !== 'todos' && ev.type !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ev.counterpart.toLowerCase().includes(q) ||
          ev.date.includes(q) ||
          ev.typeLabel.toLowerCase().includes(q) ||
          (ev.notes && ev.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allEvents, filterType, searchQuery]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-950/60 border border-blue-800/60 rounded-md shrink-0">
              <Network className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Extracción Pericial Forense
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Validado por UAYC / i2
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>Resultados de Dictámenes en PDF · Línea {PRIMARY_TARGET.phoneNumber}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Red de vínculos de llamadas y SMS del <strong className="text-slate-300">22/01/2025 al 31/01/2025</strong> y análisis de tráfico extraído en formato IBM i2 Analyst's Notebook.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('visor_pdf')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Ver PDFs Originales</span>
            </button>
            <a
              href="/assets/aistudio/6271218386_finalizado_5a1987e7.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF UAYC</span>
            </a>
          </div>
        </div>

        {/* Tarjetas de Métricas Forenses Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Objetivo Central</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{PRIMARY_TARGET.phoneNumber}</span>
            <span className="text-[10px] text-slate-300 block">Telcel México</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Periodo Auditado</span>
            <span className="text-sm font-bold text-white font-mono">10 Días</span>
            <span className="text-[10px] text-slate-300 block">22 a 31 Ene 2025</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Total Eventos PDF</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">146 Registros</span>
            <span className="text-[10px] text-slate-300 block">Llamadas + SMS + LTE</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Interlocutor Clave</span>
            <span className="text-sm font-bold text-rose-400 font-mono">6271134588</span>
            <span className="text-[10px] text-slate-300 block">20 Interacciones</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Llamada Más Larga</span>
            <span className="text-sm font-bold text-amber-400 font-mono">1,245 s (20.7m)</span>
            <span className="text-[10px] text-slate-300 block">Con 6271474227</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded">
            <span className="text-[10px] text-slate-400 font-mono block">Sesiones de Datos</span>
            <span className="text-sm font-bold text-purple-400 font-mono">72 Sesiones</span>
            <span className="text-[10px] text-slate-300 block">itelcel APN continuo</span>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas Internas */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('grafo')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'grafo'
              ? 'border-blue-500 text-white bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <Network className="w-4 h-4 text-blue-400" />
          <span>Red de Vínculos Forense (Grafo Interactivo)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matriz')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'matriz'
              ? 'border-blue-500 text-white bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Matriz de Eventos y Llamadas ({allEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('datos_lte')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'datos_lte'
              ? 'border-blue-500 text-white bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <Radio className="w-4 h-4 text-purple-400" />
          <span>Tráfico de Datos & Sesiones IP (i2)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('visor_pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'visor_pdf'
              ? 'border-blue-500 text-white bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Visor de Documentos PDF Originales</span>
        </button>
      </div>

      {/* Contenido según pestaña */}

      {/* SUBTAB 1: GRAFO DE VÍNCULOS */}
      {activeSubTab === 'grafo' && (
        <div className="space-y-6">
          {/* Simbología Pericial Oficial (como en el PDF) */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                Simbología Oficial UAYC:
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300 inline-block"></span>
                <span className="text-slate-300 text-[11px]">Rojo: Saliente (LL-S)</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300 inline-block"></span>
                <span className="text-slate-300 text-[11px]">Azul: Entrante (LL-E / M-E)</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 inline-block"></span>
                <span className="text-slate-300 text-[11px]">Ámbar: Tránsito / Transfer</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-mono">
              Formato pericial: <span className="text-slate-300 font-bold">Tipo Fecha Hora [Duración s]</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Diagrama Visual de Red de Vínculos */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between min-h-[560px] relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <span>Topología Gráfica de Comunicaciones</span>
                  </h3>
                  <span className="text-[11px] text-slate-300">
                    Haz clic en cualquier nodo para inspeccionar sus eventos y bitácora pericial
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Modelo UAYC A07
                </span>
              </div>

              {/* Contenedor Gráfico Interactivo de Nodos */}
              <div className="flex-1 my-4 flex items-center justify-between relative bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 overflow-hidden">
                {/* Columna Izquierda: Nodos Salientes y Clave */}
                <div className="flex flex-col gap-2.5 z-10 w-44">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Salientes Frecuentes</span>
                  </span>
                  {PDF_LINK_NODES.filter(n => n.positionHint === 'left').map(node => {
                    const isSelected = selectedNodeNumber === node.number;
                    return (
                      <button
                        key={node.number}
                        onClick={() => setSelectedNodeNumber(node.number)}
                        className={`text-left p-2 rounded border transition-all ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-900/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className={`font-bold ${isSelected ? 'text-rose-300' : 'text-slate-200'}`}>
                            {node.number}
                          </span>
                          <span className="text-[10px] text-rose-400 font-semibold">
                            {node.totalOutgoing} sal.
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 truncate mt-0.5">
                          {node.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Nodo Central: Línea Objetivo 6271218386 */}
                <div className="flex flex-col items-center justify-center z-20 px-3">
                  {/* Líneas conectoras virtuales */}
                  <div className="w-28 h-28 rounded-full bg-blue-600/20 border-2 border-blue-500 flex flex-col items-center justify-center text-center p-2 shadow-xl shadow-blue-900/40 animate-pulse">
                    <Smartphone className="w-6 h-6 text-blue-400 mb-1" />
                    <span className="text-[10px] font-mono text-blue-300 font-bold uppercase tracking-wider">
                      Línea Objetivo
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      6271218386
                    </span>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      18 Vínculos Directos
                    </span>
                  </div>
                </div>

                {/* Columna Derecha: Nodos Entrantes y Servicios */}
                <div className="flex flex-col gap-2.5 z-10 w-48">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" />
                    <span>Entrantes y Servicios</span>
                  </span>
                  {PDF_LINK_NODES.filter(n => n.positionHint === 'right').map(node => {
                    const isSelected = selectedNodeNumber === node.number;
                    return (
                      <button
                        key={node.number}
                        onClick={() => setSelectedNodeNumber(node.number)}
                        className={`text-left p-2 rounded border transition-all ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-900/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className={`font-bold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                            {node.number}
                          </span>
                          <span className="text-[10px] text-blue-400 font-semibold">
                            {node.totalIncomingCalls > 0 ? `${node.totalIncomingCalls} ent.` : `${node.totalIncomingMessages} sms`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 truncate mt-0.5">
                          {node.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pie de Diagrama */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <span>Diagrama generado según estándar ministerial de la UAYC</span>
                <span className="font-mono text-slate-400">Página 1 de 1 · Expediente UECS</span>
              </div>
            </div>

            {/* Panel Lateral: Detalle del Nodo Seleccionado */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-blue-400 block font-semibold">
                      Detalle de Interlocutor
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                      <span>{selectedNode.number}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {selectedNode.name}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedNode.role}
                  </span>
                </div>

                {/* Estadísticas del Nodo */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Salientes (LL-S)</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">{selectedNode.totalOutgoing}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Entrantes (LL-E)</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">{selectedNode.totalIncomingCalls}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">SMS (M-E)</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">{selectedNode.totalIncomingMessages}</span>
                  </div>
                </div>

                {/* Eventos Cronológicos Registrados en el PDF */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Eventos Documentados ({selectedNode.events.length})
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      Máx. duración: {selectedNode.maxDurationSeconds}s
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {selectedNode.events.map(ev => {
                      const isOutgoing = ev.type === 'LL-S';
                      const isIncoming = ev.type === 'LL-E';
                      const isSms = ev.type === 'M-E';
                      return (
                        <div
                          key={ev.id}
                          className="bg-slate-950/80 border border-slate-800/80 p-2 rounded flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              isOutgoing
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : isIncoming
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}>
                              {ev.type}
                            </span>
                            <span className="text-slate-300">{ev.date} {ev.time}</span>
                          </div>

                          <div className="flex items-center gap-2 text-right">
                            {ev.durationSeconds !== undefined && ev.durationSeconds > 0 && (
                              <span className="text-slate-400 text-[11px]">
                                {ev.durationSeconds}s
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-sans">
                              {ev.sourceDoc === 'ambos' ? 'UAYC+i2' : ev.sourceDoc.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botones de Acción Forense */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                {onNavigateToNumberAnalysis && !selectedNode.number.includes(' ') && (
                  <button
                    onClick={() => onNavigateToNumberAnalysis(selectedNode.number)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                    <span>Analizar Número</span>
                  </button>
                )}

                {onNavigateToMap && (
                  <button
                    onClick={() => onNavigateToMap(selectedNode.number)}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Ver en Mapa</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hallazgos e Inteligencia Criminal extraídos de los PDFs */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Conclusiones Forenses Destacadas (Dictamen UAYC & i2)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FORENSIC_INSIGHTS.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/80 p-3.5 rounded flex items-start gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 mt-0.5 ${item.badgeColor}`}>
                    {item.severity}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MATRIZ DE EVENTOS COMPLETA */}
      {activeSubTab === 'matriz' && (
        <div className="space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por número, fecha o nota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="todos">Todos los Tipos ({allEvents.length})</option>
                <option value="LL-S">Salientes (LL-S)</option>
                <option value="LL-E">Entrantes (LL-E)</option>
                <option value="M-E">SMS Entrante (M-E)</option>
                <option value="LL-TRANSFER">Transferencias</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <span>Mostrando {filteredEvents.length} de {allEvents.length} eventos</span>
            </div>
          </div>

          {/* Tabla de Registros Extraídos */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Tipo de Tráfico</th>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Línea Auditada (A)</th>
                    <th className="p-3">Interlocutor (B)</th>
                    <th className="p-3 text-right">Duración (seg)</th>
                    <th className="p-3">Fuente PDF</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {filteredEvents.map((ev, index) => {
                    const isOutgoing = ev.type === 'LL-S';
                    const isIncoming = ev.type === 'LL-E';
                    return (
                      <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-slate-300 text-[11px]">{index + 1}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            isOutgoing
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : isIncoming
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          }`}>
                            {ev.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-200">
                          {ev.date} <span className="text-slate-400">{ev.time}</span>
                        </td>
                        <td className="p-3 font-bold text-blue-400">
                          {ev.targetNumber}
                        </td>
                        <td className="p-3 font-bold text-white">
                          {ev.counterpart}
                        </td>
                        <td className="p-3 text-right tabular-nums text-slate-200">
                          {ev.durationSeconds !== undefined ? `${ev.durationSeconds}s` : '-'}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-sans">
                            {ev.sourceDoc === 'ambos' ? 'UAYC + i2' : ev.sourceDoc.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {onNavigateToNumberAnalysis && !ev.counterpart.includes(' ') && (
                            <button
                              onClick={() => onNavigateToNumberAnalysis(ev.counterpart)}
                              className="text-[11px] text-blue-400 hover:text-blue-300 underline font-sans"
                            >
                              Analizar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATOS LTE / SESIONES IP */}
      {activeSubTab === 'datos_lte' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Sesiones de Datos IP y Conexiones Continuas (Extracción i2)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Volcado de registros GPRS/LTE extraídos del documento IBM i2 para la línea 6271218386. Sesiones de navegación y transferencias nocturnas.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
                APN: internet.itelcel.com
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Sesiones de Larga Duración</span>
                <span className="text-base font-bold text-purple-400 font-mono">3,600s - 7,201s</span>
                <span className="text-[10px] text-slate-300 block">Conexiones ininterrumpidas de 1 a 2 horas</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Horarios Clave</span>
                <span className="text-base font-bold text-amber-400 font-mono">00:00 - 05:00 hrs</span>
                <span className="text-[10px] text-slate-300 block">Actividad recurrente durante la madrugada</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Volumen Transferido Máx.</span>
                <span className="text-base font-bold text-emerald-400 font-mono">58.4 MB</span>
                <span className="text-[10px] text-slate-300 block">30/01/2025 16:26:41</span>
              </div>
            </div>
          </div>

          {/* Tabla de Sesiones de Datos */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-white flex items-center justify-between">
              <span>Muestra Pericial de Sesiones de Datos Registradas</span>
              <span className="text-[11px] font-mono text-slate-300">Fuente: 6271218386_infomraci_n_extra_da_I2_d8519f17.pdf</span>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Hora de Conexión</th>
                    <th className="p-3">Duración de Sesión</th>
                    <th className="p-3">Volumen Estimado</th>
                    <th className="p-3">Punto de Acceso (APN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {PDF_DATA_SESSIONS_SAMPLE.map((session, i) => (
                    <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-slate-300 text-[11px]">{i + 1}</td>
                      <td className="p-3 text-white font-semibold">{session.date}</td>
                      <td className="p-3 text-slate-200">{session.time}</td>
                      <td className="p-3 tabular-nums font-bold text-purple-400">
                        {session.durationSeconds} s ({(session.durationSeconds / 60).toFixed(1)} min)
                      </td>
                      <td className="p-3 text-emerald-400">{session.volumeBytesApprox}</td>
                      <td className="p-3 text-slate-400">{session.apn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: VISOR DE DOCUMENTOS PDF ORIGINALES */}
      {activeSubTab === 'visor_pdf' && (
        <div className="space-y-4">
          {/* Selector de Archivo PDF */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {PDF_DOCUMENTS.map(doc => {
                const isActive = activePdfDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActivePdfDocId(doc.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded flex items-center gap-2 transition-all border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{doc.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activePdfDoc.path}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Pestaña Completa</span>
              </a>
              <a
                href={activePdfDoc.path}
                download={activePdfDoc.fileName}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo</span>
              </a>
            </div>
          </div>

          {/* Información del PDF seleccionado */}
          <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{activePdfDoc.title}</span>
              <span className="text-slate-300 font-mono">({activePdfDoc.fileName})</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                {activePdfDoc.unit}
              </span>
            </div>
            <span className="text-slate-300 text-[11px] font-mono">
              Ruta en servidor: {activePdfDoc.path}
            </span>
          </div>

          {/* Visor IFrame Embebido */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl h-[700px] relative">
            <iframe
              src={activePdfDoc.path}
              title={activePdfDoc.title}
              className="w-full h-full border-none bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );
};
