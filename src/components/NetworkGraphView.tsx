import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CallDetailRecord, InvestigationCase, PhoneLabel } from '../types/telecom';
import { 
  Network, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  PhoneCall, 
  ShieldAlert, 
  User, 
  Maximize2,
  Info,
  Clock,
  ArrowRight,
  Sliders,
  Layers
} from 'lucide-react';

interface NetworkGraphViewProps {
  records: CallDetailRecord[];
  labels: PhoneLabel[];
  activeCase: InvestigationCase;
  onOpenLabelModal: (phoneNumber: string) => void;
  onNavigateToNumberAnalysis: (phoneNumber: string) => void;
}

interface GraphNode {
  id: string; // phone number
  cleanNumber: string;
  label?: PhoneLabel;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  totalCalls: number;
  totalDuration: number;
  outgoingCount: number;
  incomingCount: number;
  category: string;
  color: string;
  isPrimaryTarget: boolean;
  degree: number;
}

interface GraphLink {
  sourceId: string;
  targetId: string;
  callCount: number;
  totalDuration: number;
  isCritical: boolean;
  hasSms: boolean;
  hasVoice: boolean;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  records,
  labels,
  activeCase,
  onOpenLabelModal,
  onNavigateToNumberAnalysis
}) => {
  const [layoutMode, setLayoutMode] = useState<'radial' | 'grouped' | 'circular'>('radial');
  const [minCallsThreshold, setMinCallsThreshold] = useState<number>(1);
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'VOZ' | 'SMS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Arrastre interactivo de nodos
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [customNodePositions, setCustomNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mapa de etiquetas
  const labelMap = useMemo(() => {
    const map = new Map<string, PhoneLabel>();
    labels.forEach(l => {
      map.set(l.phoneNumber.replace(/\D/g, ''), l);
    });
    return map;
  }, [labels]);

  // Filtrar registros según controles
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (eventTypeFilter === 'VOZ' && !r.eventType.startsWith('VOZ')) return false;
      if (eventTypeFilter === 'SMS' && !r.eventType.startsWith('SMS')) return false;
      return true;
    });
  }, [records, eventTypeFilter]);

  // Construir enlaces y nodos a partir de los registros
  const { nodes, links } = useMemo(() => {
    const nodeStats: Record<string, {
      totalCalls: number;
      totalDuration: number;
      outgoingCount: number;
      incomingCount: number;
      connectedPeers: Set<string>;
    }> = {};

    const linkMap: Record<string, {
      sourceId: string;
      targetId: string;
      callCount: number;
      totalDuration: number;
      isCritical: boolean;
      hasSms: boolean;
      hasVoice: boolean;
    }> = {};

    filteredRecords.forEach(r => {
      const a = r.numberA;
      const b = r.numberB;
      const isCritical = Boolean(r.notes?.toLowerCase().includes('rescate') || r.notes?.toLowerCase().includes('exigencia'));
      const isVoice = r.eventType.startsWith('VOZ');
      const isSms = r.eventType.startsWith('SMS');

      // Stats nodo A
      if (!nodeStats[a]) {
        nodeStats[a] = { totalCalls: 0, totalDuration: 0, outgoingCount: 0, incomingCount: 0, connectedPeers: new Set() };
      }
      nodeStats[a].totalCalls++;
      nodeStats[a].outgoingCount++;
      nodeStats[a].totalDuration += r.durationSeconds;
      nodeStats[a].connectedPeers.add(b);

      // Stats nodo B
      if (!nodeStats[b]) {
        nodeStats[b] = { totalCalls: 0, totalDuration: 0, outgoingCount: 0, incomingCount: 0, connectedPeers: new Set() };
      }
      nodeStats[b].totalCalls++;
      nodeStats[b].incomingCount++;
      nodeStats[b].totalDuration += r.durationSeconds;
      nodeStats[b].connectedPeers.add(a);

      // Link bilateral ordenado
      const linkKey = [a, b].sort().join('__');
      if (!linkMap[linkKey]) {
        linkMap[linkKey] = {
          sourceId: a,
          targetId: b,
          callCount: 0,
          totalDuration: 0,
          isCritical: false,
          hasSms: false,
          hasVoice: false
        };
      }
      linkMap[linkKey].callCount++;
      linkMap[linkKey].totalDuration += r.durationSeconds;
      if (isCritical) linkMap[linkKey].isCritical = true;
      if (isSms) linkMap[linkKey].hasSms = true;
      if (isVoice) linkMap[linkKey].hasVoice = true;
    });

    // Filtrar enlaces por umbral mínimo de llamadas
    const validLinks = Object.values(linkMap).filter(l => l.callCount >= minCallsThreshold);

    // Nodos participantes
    const activeNodeIds = new Set<string>();
    validLinks.forEach(l => {
      activeNodeIds.add(l.sourceId);
      activeNodeIds.add(l.targetId);
    });

    // Asegurar que el objetivo principal esté presente
    if (activeCase.primaryTargetNumber) {
      activeNodeIds.add(activeCase.primaryTargetNumber);
    }

    // Coordenadas calculadas según el modo de layout
    const width = 860;
    const height = 580;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodeArray: GraphNode[] = Array.from(activeNodeIds).map((id, index, arr) => {
      const clean = id.replace(/\D/g, '');
      const label = labelMap.get(clean);
      const isPrimary = id === activeCase.primaryTargetNumber;
      const stats = nodeStats[id] || { totalCalls: 0, totalDuration: 0, outgoingCount: 0, incomingCount: 0, connectedPeers: new Set() };

      let x = centerX;
      let y = centerY;

      if (customNodePositions[id]) {
        x = customNodePositions[id].x;
        y = customNodePositions[id].y;
      } else if (layoutMode === 'radial') {
        if (isPrimary) {
          x = centerX;
          y = centerY;
        } else {
          // Disposición por anillos radiales según volumen
          const otherIndex = arr.filter(n => n !== activeCase.primaryTargetNumber).indexOf(id);
          const totalOthers = arr.length - 1 || 1;
          const radius = stats.totalCalls > 10 ? 175 : (stats.totalCalls > 4 ? 245 : 305);
          const angle = (otherIndex / totalOthers) * 2 * Math.PI - Math.PI / 2;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }
      } else if (layoutMode === 'grouped') {
        // Agrupación táctica por cuadrantes/columnas
        const cat = label?.category || 'otro';
        if (cat === 'sospechoso' || cat === 'dealer') {
          // Columna izquierda (Sospechosos / Amenazas)
          const idx = arr.filter(n => {
            const l = labelMap.get(n.replace(/\D/g, ''));
            return l?.category === 'sospechoso' || l?.category === 'dealer';
          }).indexOf(id);
          x = 160;
          y = 120 + idx * 80;
        } else if (cat === 'victima' || cat === 'papa' || cat === 'mama' || cat === 'tia' || cat === 'hermano') {
          // Columna central (Familia y Víctimas)
          const idx = arr.filter(n => {
            const l = labelMap.get(n.replace(/\D/g, ''));
            return l?.category === 'victima' || l?.category === 'papa' || l?.category === 'mama' || l?.category === 'tia' || l?.category === 'hermano';
          }).indexOf(id);
          x = centerX;
          y = 110 + idx * 75;
        } else {
          // Columna derecha (Intermediarios, choferes, tiendas)
          const idx = arr.filter(n => {
            const l = labelMap.get(n.replace(/\D/g, ''));
            const c = l?.category || 'otro';
            return c !== 'sospechoso' && c !== 'dealer' && c !== 'victima' && c !== 'papa' && c !== 'mama' && c !== 'tia' && c !== 'hermano';
          }).indexOf(id);
          x = width - 170;
          y = 120 + idx * 80;
        }
      } else {
        // Disposición Circular General
        const angle = (index / arr.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 230;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }

      // Colores de categoría
      let defaultColor = '#38BDF8'; // cyan
      if (isPrimary || label?.category === 'sospechoso') defaultColor = '#EF4444'; // rojo
      else if (label?.category === 'dealer') defaultColor = '#DC2626'; // rojo oscuro
      else if (label?.category === 'victima') defaultColor = '#3B82F6'; // azul
      else if (label?.category === 'papa' || label?.category === 'mama') defaultColor = '#10B981'; // esmeralda
      else if (label?.category === 'tia' || label?.category === 'hermano') defaultColor = '#8B5CF6'; // morado
      else if (label?.category === 'didi') defaultColor = '#F59E0B'; // ámbar
      else if (label?.category === 'tienda') defaultColor = '#64748B'; // pizarra

      return {
        id,
        cleanNumber: clean,
        label,
        x,
        y,
        totalCalls: stats.totalCalls,
        totalDuration: stats.totalDuration,
        outgoingCount: stats.outgoingCount,
        incomingCount: stats.incomingCount,
        category: label?.category || (isPrimary ? 'sospechoso' : 'contacto'),
        color: label?.color || defaultColor,
        isPrimaryTarget: isPrimary,
        degree: stats.connectedPeers.size
      };
    });

    return { nodes: nodeArray, links: validLinks };
  }, [filteredRecords, labelMap, activeCase.primaryTargetNumber, minCallsThreshold, layoutMode, customNodePositions]);

  // Nodo seleccionado
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Manejar arrastre de nodos con ratón
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedLink(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    setCustomNodePositions(prev => ({
      ...prev,
      [draggingNodeId]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Reset de posiciones
  const handleResetPositions = () => {
    setCustomNodePositions({});
    setZoomLevel(1);
    setSelectedNodeId(null);
    setSelectedLink(null);
  };

  // Nodos y enlaces destacados según selección
  const isNodeHighlighted = (nodeId: string) => {
    if (!selectedNodeId) return true;
    if (nodeId === selectedNodeId) return true;
    return links.some(
      l => (l.sourceId === selectedNodeId && l.targetId === nodeId) ||
           (l.targetId === selectedNodeId && l.sourceId === nodeId)
    );
  };

  const isLinkHighlighted = (link: GraphLink) => {
    if (!selectedNodeId) return true;
    return link.sourceId === selectedNodeId || link.targetId === selectedNodeId;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Barra de Controles Tácticos Superior */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="tracking-wide">RED DE VÍNCULOS TELEFÓNICOS</span>
          </div>
          <span className="text-slate-600">|</span>

          {/* Selector de Disposición Visual */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Distribución:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => { setLayoutMode('radial'); setCustomNodePositions({}); }}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  layoutMode === 'radial' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                Radial (Objetivo)
              </button>
              <button
                onClick={() => { setLayoutMode('grouped'); setCustomNodePositions({}); }}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  layoutMode === 'grouped' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roles Tácticos
              </button>
              <button
                onClick={() => { setLayoutMode('circular'); setCustomNodePositions({}); }}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  layoutMode === 'circular' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                Circular
              </button>
            </div>
          </div>

          {/* Filtro Umbral de Llamadas */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Umbral Mín:</span>
            <select
              value={minCallsThreshold}
              onChange={(e) => setMinCallsThreshold(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-xs text-cyan-300 py-1 px-2 rounded font-mono font-bold"
            >
              <option value={1}>≥ 1 Comunicación</option>
              <option value={2}>≥ 2 Comunicaciones</option>
              <option value={3}>≥ 3 Comunicaciones</option>
              <option value={5}>≥ 5 Comunicaciones (Nuclear)</option>
            </select>
          </div>

          {/* Filtro Tipo de Evento */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setEventTypeFilter('ALL')}
              className={`px-2 py-1 rounded text-[11px] font-semibold ${
                eventTypeFilter === 'ALL' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({filteredRecords.length})
            </button>
            <button
              onClick={() => setEventTypeFilter('VOZ')}
              className={`px-2 py-1 rounded text-[11px] font-semibold ${
                eventTypeFilter === 'VOZ' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo Voz
            </button>
            <button
              onClick={() => setEventTypeFilter('SMS')}
              className={`px-2 py-1 rounded text-[11px] font-semibold ${
                eventTypeFilter === 'SMS' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo SMS
            </button>
          </div>
        </div>

        {/* Controles de Zoom y Búsqueda */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded">
            <button
              onClick={() => setZoomLevel(z => Math.min(1.8, z + 0.15))}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
              title="Acercar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
              title="Alejar Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetPositions}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Restablecer Posiciones"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="font-mono text-cyan-400 text-xs">
            {nodes.length} Nodos · {links.length} Enlaces
          </span>
        </div>
      </div>

      {/* Contenedor Principal: Canvas SVG del Grafo + Panel Inspector Lateral */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Lienzo Interactivo SVG */}
        <div 
          className="flex-1 h-full w-full relative bg-radial from-slate-900 to-slate-950 overflow-hidden cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => { setSelectedNodeId(null); setSelectedLink(null); }}
        >
          {/* Cuadrícula Táctica de Fondo */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />

          <svg
            ref={svgRef}
            viewBox="0 0 860 580"
            className="w-full h-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: draggingNodeId ? 'none' : 'transform 0.15s ease-out' }}
          >
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Marcadores de flechas direccionales */}
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" fillOpacity="0.7" />
              </marker>
              <marker id="arrow-critical" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" fillOpacity="0.9" />
              </marker>
            </defs>

            {/* Capa de Enlaces / Conexiones */}
            <g className="links">
              {links.map((link) => {
                const sourceNode = nodes.find(n => n.id === link.sourceId);
                const targetNode = nodes.find(n => n.id === link.targetId);
                if (!sourceNode || !targetNode) return null;

                const isHighlighted = isLinkHighlighted(link);
                const isSelected = selectedLink === link;
                const strokeWidth = Math.min(Math.max(link.callCount * 1.2, 1.8), 6);

                const strokeColor = link.isCritical 
                  ? '#EF4444' 
                  : (link.hasVoice ? '#0284C7' : '#F59E0B');

                // Punto medio para etiqueta de conteo
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;

                return (
                  <g 
                    key={`${link.sourceId}__${link.targetId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLink(link);
                      setSelectedNodeId(null);
                    }}
                    className="cursor-pointer group"
                    opacity={isHighlighted ? 1 : 0.15}
                  >
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                      strokeDasharray={link.isCritical ? '4 2' : 'none'}
                      strokeOpacity={isSelected ? 1 : (isHighlighted ? 0.75 : 0.2)}
                      markerEnd={link.isCritical ? 'url(#arrow-critical)' : 'url(#arrow)'}
                      className="transition-all"
                    />

                    {/* Badge numérico en medio del enlace */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <circle 
                        r="9" 
                        fill="#060D17" 
                        stroke={strokeColor} 
                        strokeWidth="1.2" 
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                      >
                        {link.callCount}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Capa de Nodos Telefónicos */}
            <g className="nodes">
              {nodes.map((node) => {
                const isHighlighted = isNodeHighlighted(node.id);
                const isSelected = selectedNodeId === node.id;
                const radius = node.isPrimaryTarget ? 24 : Math.min(Math.max(node.totalCalls * 1.5 + 14, 16), 26);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleMouseDown(node.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setSelectedLink(null);
                    }}
                    className="cursor-grab active:cursor-grabbing group select-none"
                    opacity={isHighlighted ? 1 : 0.2}
                  >
                    {/* Anillo de pulso para objetivo principal o seleccionado */}
                    {(node.isPrimaryTarget || isSelected) && (
                      <circle
                        r={radius + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Cuerpo del nodo */}
                    <circle
                      r={radius}
                      fill="#060D17"
                      stroke={node.color}
                      strokeWidth={isSelected ? 3.5 : 2.5}
                      filter={node.isPrimaryTarget ? 'url(#glow-red)' : (isSelected ? 'url(#glow-cyan)' : 'none')}
                    />

                    {/* Icono central o inicial */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#FFFFFF"
                      fontSize={node.isPrimaryTarget ? '13' : '11'}
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontWeight="bold"
                    >
                      {node.label?.category === 'sospechoso' ? 'S' :
                       node.label?.category === 'victima' ? 'V' :
                       node.label?.category === 'papa' || node.label?.category === 'mama' ? 'F' :
                       node.label?.category === 'didi' ? 'D' :
                       node.label?.category === 'dealer' ? 'DL' : 'TEL'}
                    </text>

                    {/* Etiqueta con número y nombre debajo del nodo */}
                    <g transform={`translate(0, ${radius + 14})`}>
                      <rect
                        x="-54"
                        y="-8"
                        width="108"
                        height="18"
                        rx="3"
                        fill="#050B14"
                        stroke={isSelected ? '#38BDF8' : '#1E293B'}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                      >
                        {node.id}
                      </text>
                    </g>

                    {/* Subtítulo con descripción de la etiqueta */}
                    {node.label && (
                      <text
                        y={radius + 33}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="8.5"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                        className="truncate"
                      >
                        {node.label.label.length > 20 ? node.label.label.substring(0, 18) + '...' : node.label.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Leyenda Táctica en la Esquina Inferior Izquierda */}
          <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 p-3 rounded text-[11px] font-mono text-slate-300 space-y-1.5 shadow-xl backdrop-blur-sm pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Categorías de Inteligencia
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Sospechoso / Blanco Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Víctima Directa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Familiares (Papá / Mamá)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Logística / Didi / Proveedor</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans">
              * Arrastre los nodos para reacomodar el esquema judicial
            </div>
          </div>
        </div>

        {/* Panel Lateral Inspector (Detalle de Nodo o Enlace Seleccionado) */}
        <aside className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-20 overflow-hidden">
          {selectedNode ? (
            /* Detalle del Nodo Seleccionado */
            <div className="flex flex-col h-full justify-between">
              <div className="p-4 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: selectedNode.color }}>
                    {selectedNode.category.toUpperCase()}
                  </span>
                  <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <h3 className="text-base font-bold font-mono text-white tracking-tight">{selectedNode.id}</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {selectedNode.label?.label || 'Línea telefónica sin clasificar'}
                </p>
                {selectedNode.label?.associatedSuspect && (
                  <div className="mt-1 text-[11px] text-rose-400 font-mono">
                    Alias: <strong>{selectedNode.label.associatedSuspect}</strong>
                  </div>
                )}
              </div>

              {/* Estadísticas de la Línea en el Grafo */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Grado de Enlaces</span>
                    <span className="text-cyan-400 font-bold text-sm mt-0.5 block">
                      {selectedNode.degree} contactos
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Comunicaciones</span>
                    <span className="text-white font-bold text-sm mt-0.5 block">
                      {selectedNode.totalCalls} eventos
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Llamadas Salientes:</span>
                    <span className="text-blue-400 font-bold">{selectedNode.outgoingCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Llamadas Entrantes:</span>
                    <span className="text-emerald-400 font-bold">{selectedNode.incomingCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span>Tiempo Acumulado:</span>
                    <span className="text-white font-bold">{Math.round(selectedNode.totalDuration / 60)} min</span>
                  </div>
                </div>

                {/* Lista de Vínculos Directos con este Nodo */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Conexiones Directas ({selectedNode.degree})
                  </h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs">
                    {links
                      .filter(l => l.sourceId === selectedNode.id || l.targetId === selectedNode.id)
                      .map((l) => {
                        const peerId = l.sourceId === selectedNode.id ? l.targetId : l.sourceId;
                        const peerLabel = labelMap.get(peerId.replace(/\D/g, ''));
                        return (
                          <div
                            key={peerId}
                            onClick={() => setSelectedNodeId(peerId)}
                            className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{peerId}</span>
                                {peerLabel && (
                                  <span className="text-[10px] text-slate-400 font-sans">
                                    ({peerLabel.label})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {Math.round(l.totalDuration / 60)} min acum.
                              </span>
                            </div>
                            <span className="font-bold text-cyan-400 font-mono">
                              {l.callCount} calls
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
                <button
                  onClick={() => onOpenLabelModal(selectedNode.id)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Editar Etiqueta
                </button>
                <button
                  onClick={() => onNavigateToNumberAnalysis(selectedNode.id)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors"
                >
                  Ver Ficha Forense →
                </button>
              </div>
            </div>
          ) : selectedLink ? (
            /* Detalle del Enlace Seleccionado */
            <div className="flex flex-col h-full justify-between">
              <div className="p-4 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Vínculo Bilateral Detectado
                  </span>
                  <button onClick={() => setSelectedLink(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="flex items-center justify-between font-mono text-sm font-bold text-white">
                  <span>{selectedLink.sourceId}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 mx-2" />
                  <span>{selectedLink.targetId}</span>
                </div>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Comunicaciones</span>
                    <span className="text-cyan-400 font-bold text-base mt-0.5 block">
                      {selectedLink.callCount} veces
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Duración Total</span>
                    <span className="text-white font-bold text-base mt-0.5 block">
                      {Math.round(selectedLink.totalDuration / 60)} min
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Naturaleza de los Eventos
                  </span>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Llamadas de Voz:</span>
                    <span className={selectedLink.hasVoice ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {selectedLink.hasVoice ? '✓ Presente' : '✕ No registrado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Mensajería SMS:</span>
                    <span className={selectedLink.hasSms ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      {selectedLink.hasSms ? '✓ Presente' : '✕ No registrado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span>Nivel Crítico (Rescate/Extorsión):</span>
                    <span className={selectedLink.isCritical ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {selectedLink.isCritical ? 'ALERTA MÁXIMA' : 'Estándar'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950/80">
                <p className="text-[11px] text-slate-400 text-center font-sans">
                  Vínculo verificado dentro de la carpeta {activeCase.caseNumber}
                </p>
              </div>
            </div>
          ) : (
            /* Estado Inicial de Ayuda */
            <div className="p-6 flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-3">
              <Network className="w-12 h-12 text-slate-700" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Inspector de Vínculos</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Haga clic en cualquier nodo telefónico para examinar su red de contactos o seleccione una línea de conexión para ver el cruce bilateral.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
