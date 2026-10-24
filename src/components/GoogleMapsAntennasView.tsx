/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de Análisis Geoespacial y Cartografía Forense de Celdas Telefónicas
 * Incluye visor cartográfico vectorial táctico autónomo (offline) y soporte opcional para Google Maps.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { CallDetailRecord, CellTower, PhoneLabel } from '../types/telecom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Compass, 
  Radio, 
  Layers, 
  Calendar, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Key,
  Shield,
  Info
} from 'lucide-react';

interface GoogleMapsAntennasViewProps {
  towers: CellTower[];
  records: CallDetailRecord[];
  labels: PhoneLabel[];
  selectedTargetPhone?: string;
  focusedTowerId?: string;
  onOpenLabelModal: (phone: string) => void;
}

// Bounding Box para el mapeo geoespacial de Ciudad Juárez, Chihuahua
const JUAREZ_BOUNDS = {
  minLat: 31.5500,
  maxLat: 31.8100,
  minLng: -106.5700,
  maxLng: -106.2500
};

// Subcomponente para renderizar polilíneas de ruta y conos de azimut en Google Maps cuando esté activo
const MapOverlaysRenderer: React.FC<{
  towers: CellTower[];
  showAzimuthCones: boolean;
  routeRecords: CallDetailRecord[];
  currentPlaybackStep: number;
  selectedTower: CellTower | null;
}> = ({ towers, showAzimuthCones, routeRecords, currentPlaybackStep, selectedTower }) => {
  const map = useMap();
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const computeDestinationPoint = (
    lat: number,
    lng: number,
    distanceMeters: number,
    bearingDegrees: number
  ) => {
    const R = 6371000;
    const d = distanceMeters;
    const brng = (bearingDegrees * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lng * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d / R) +
        Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
        Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      lat: (lat2 * 180) / Math.PI,
      lng: (lon2 * 180) / Math.PI
    };
  };

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    polygonsRef.current.forEach(p => p.setMap(null));
    polygonsRef.current = [];

    if (!showAzimuthCones) return;

    towers.forEach(tower => {
      const isSelected = selectedTower?.id === tower.id;
      const center = { lat: tower.latitude, lng: tower.longitude };
      const beamWidth = tower.beamWidth || 65;
      const range = tower.rangeMeters || 1200;
      const startAngle = tower.azimuth - beamWidth / 2;
      const endAngle = tower.azimuth + beamWidth / 2;

      const path = [center];
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const currentAngle = startAngle + (i / steps) * (endAngle - startAngle);
        path.push(computeDestinationPoint(center.lat, center.lng, range, currentAngle));
      }
      path.push(center);

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: isSelected ? '#F59E0B' : '#3B82F6',
        strokeOpacity: isSelected ? 0.9 : 0.6,
        strokeWeight: isSelected ? 2 : 1,
        fillColor: isSelected ? '#F59E0B' : '#3B82F6',
        fillOpacity: isSelected ? 0.35 : 0.15,
        map
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach(p => p.setMap(null));
    };
  }, [map, towers, showAzimuthCones, selectedTower]);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (routeRecords.length < 2) return;

    const visiblePoints = routeRecords.slice(0, currentPlaybackStep + 1).map(r => ({
      lat: r.latitude,
      lng: r.longitude
    }));

    polylineRef.current = new google.maps.Polyline({
      path: visiblePoints,
      geodesic: true,
      strokeColor: '#EF4444',
      strokeOpacity: 0.85,
      strokeWeight: 3.5,
      map
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, routeRecords, currentPlaybackStep]);

  return null;
};

export const GoogleMapsAntennasView: React.FC<GoogleMapsAntennasViewProps> = ({
  towers,
  records,
  labels,
  selectedTargetPhone = '656-789-2041',
  focusedTowerId,
  onOpenLabelModal
}) => {
  // Manejo de clave de Google Maps (si existe en env o guardada manualmente)
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('antisec_custom_maps_key') || '');
  const activeKey = envKey || customKey;

  // Estado del motor de mapa (vectorial táctico por defecto si no hay key válida)
  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(() => Boolean(activeKey && activeKey.trim().length > 10));
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [keyInputValue, setKeyInputValue] = useState<string>(activeKey);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  // Coordenadas centrales de Ciudad Juárez
  const defaultCenter = { lat: 31.6904, lng: -106.4245 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  // Estados del visor cartográfico táctico autónomo (zoom y paneo)
  const [tacticalZoom, setTacticalZoom] = useState<number>(1);
  const [tacticalPan, setTacticalPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Estados interactivos forenses
  const [showAzimuthCones, setShowAzimuthCones] = useState<boolean>(true);
  const [selectedTower, setSelectedTower] = useState<CellTower | null>(null);
  const [activeNumberForRoute, setActiveNumberForRoute] = useState<string>(selectedTargetPhone);
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');

  // Enfoque inicial de antena si se solicita
  useEffect(() => {
    if (focusedTowerId) {
      const t = towers.find(tower => tower.id === focusedTowerId);
      if (t) {
        setSelectedTower(t);
        setMapCenter({ lat: t.latitude, lng: t.longitude });
        setMapZoom(14);
      }
    }
  }, [focusedTowerId, towers]);

  // Lista de fechas únicas en la sábana
  const availableDates = useMemo(() => {
    return Array.from(new Set(records.map(r => r.date))).sort();
  }, [records]);

  // Registros filtrados por fecha
  const filteredRecords = useMemo(() => {
    if (selectedDateFilter === 'ALL') return records;
    return records.filter(r => r.date === selectedDateFilter);
  }, [records, selectedDateFilter]);

  // Registros de la ruta activa
  const targetRouteRecords = useMemo(() => {
    const clean = activeNumberForRoute.replace(/\D/g, '');
    return filteredRecords
      .filter(r => r.numberA.replace(/\D/g, '') === clean || r.numberB.replace(/\D/g, '') === clean)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredRecords, activeNumberForRoute]);

  // Estadísticas por antena
  const towerConnectionStats = useMemo(() => {
    const map: Record<string, { total: number; numbers: Set<string>; lastTime: string }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.towerId]) {
        map[r.towerId] = { total: 0, numbers: new Set(), lastTime: r.time };
      }
      map[r.towerId].total += 1;
      map[r.towerId].numbers.add(r.numberA);
      map[r.towerId].numbers.add(r.numberB);
      map[r.towerId].lastTime = r.time;
    });
    return map;
  }, [filteredRecords]);

  // Conexiones de la antena seleccionada
  const selectedTowerConnections = useMemo(() => {
    if (!selectedTower) return [];
    return filteredRecords.filter(r => r.towerId === selectedTower.id);
  }, [selectedTower, filteredRecords]);

  // Temporizador de reproducción paso a paso
  useEffect(() => {
    let timer: any;
    if (isPlayingRoute && targetRouteRecords.length > 0) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= targetRouteRecords.length - 1) {
            setIsPlayingRoute(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlayingRoute, targetRouteRecords]);

  // Funciones de transformación de coordenadas geográficas a SVG
  const projectCoords = (lat: number, lng: number, width: number = 1000, height: number = 800) => {
    const { minLat, maxLat, minLng, maxLng } = JUAREZ_BOUNDS;
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  // Generador de arco SVG para los conos de azimut sectoriales
  const generateAzimuthSectorPath = (
    centerX: number,
    centerY: number,
    radius: number,
    azimuthDeg: number,
    beamWidthDeg: number = 65
  ) => {
    // En SVG: 0° es norte (hacia arriba, y negativo)
    const startAngle = (azimuthDeg - beamWidthDeg / 2 - 90) * (Math.PI / 180);
    const endAngle = (azimuthDeg + beamWidthDeg / 2 - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = beamWidthDeg > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Manejadores de arrastre y paneo del mapa táctico
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - tacticalPan.x, y: e.clientY - tacticalPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTacticalPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCustomKey = () => {
    const trimmed = keyInputValue.trim();
    setCustomKey(trimmed);
    localStorage.setItem('antisec_custom_maps_key', trimmed);
    if (trimmed.length > 10) {
      setUseGoogleMaps(true);
      setGoogleMapsError(null);
    } else {
      setUseGoogleMaps(false);
    }
    setIsKeyModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 select-none">
      {/* Barra Superior de Control Geoespacial */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Cartografía Forense Juárez</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded text-[11px] font-mono">
            <button
              onClick={() => {
                setUseGoogleMaps(false);
                setGoogleMapsError(null);
              }}
              className={`px-2 py-0.5 rounded transition-colors ${
                !useGoogleMaps
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visor Táctico GIS (Autónomo)
            </button>
            <button
              onClick={() => {
                if (!activeKey) {
                  setIsKeyModalOpen(true);
                } else {
                  setUseGoogleMaps(true);
                }
              }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                useGoogleMaps
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Google Maps</span>
              {!activeKey && <Key className="w-2.5 h-2.5 text-amber-400" />}
            </button>
          </div>

          <span className="text-slate-700">|</span>

          {/* Selector de Fecha */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Fecha:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                setCurrentStep(0);
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-white py-1 px-2 rounded font-mono"
            >
              <option value="ALL">Todas las fechas registradas</option>
              {availableDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Toggle Conos de Azimut */}
          <button
            onClick={() => setShowAzimuthCones(!showAzimuthCones)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              showAzimuthCones
                ? 'bg-blue-950 text-blue-300 border-blue-700'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {showAzimuthCones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Conos de Azimut ({showAzimuthCones ? 'Visibles' : 'Ocultos'})</span>
          </button>
        </div>

        {/* Controles de Trazado de Ruta del Investigado */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Ruta de Interés:</span>
          <select
            value={activeNumberForRoute}
            onChange={(e) => {
              setActiveNumberForRoute(e.target.value);
              setCurrentStep(0);
              setIsPlayingRoute(false);
            }}
            className="bg-slate-950 border border-slate-700 text-xs text-white py-1 px-2 rounded font-mono font-bold"
          >
            <option value="656-789-2041">656-789-2041 (Sospechoso 1)</option>
            <option value="656-312-9988">656-312-9988 (Sospechoso 2)</option>
            <option value="656-554-1122">656-554-1122 (Víctima)</option>
            <option value="656-654-0011">656-654-0011 (Didi / Chofer)</option>
          </select>

          {/* Reproductor de Ruta */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep <= 0}
              title="Paso Anterior"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlayingRoute(!isPlayingRoute)}
              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded flex items-center gap-1 font-semibold"
            >
              {isPlayingRoute ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlayingRoute ? 'Pausar' : 'Reproducir'}</span>
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(targetRouteRecords.length - 1, prev + 1))}
              disabled={currentStep >= targetRouteRecords.length - 1}
              title="Paso Siguiente"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlayingRoute(false);
              }}
              title="Reiniciar Ruta"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="font-mono text-slate-400 text-[11px] tabular-nums">
            Paso {targetRouteRecords.length > 0 ? currentStep + 1 : 0}/{targetRouteRecords.length}
          </span>
        </div>
      </div>

      {/* Contenedor Principal del Mapa */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* VISTA 1: GOOGLE MAPS (Si el usuario configuró clave y está activo) */}
        {useGoogleMaps && activeKey && !googleMapsError ? (
          <div className="flex-1 h-full w-full relative">
            <APIProvider apiKey={activeKey}>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={12}
                center={mapCenter}
                zoom={mapZoom}
                mapId="DEMO_MAP_ID"
                className="w-full h-full"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                disableDefaultUI={false}
                zoomControl={true}
                streetViewControl={false}
                mapTypeControl={true}
                fullscreenControl={false}
              >
                <MapOverlaysRenderer
                  towers={towers}
                  showAzimuthCones={showAzimuthCones}
                  routeRecords={targetRouteRecords}
                  currentPlaybackStep={currentStep}
                  selectedTower={selectedTower}
                />

                {towers.map(tower => {
                  const stats = towerConnectionStats[tower.id] || { total: 0, numbers: new Set() };
                  const isSelected = selectedTower?.id === tower.id;

                  return (
                    <AdvancedMarker
                      key={tower.id}
                      position={{ lat: tower.latitude, lng: tower.longitude }}
                      onClick={() => setSelectedTower(tower)}
                      title={`${tower.name} (${stats.total} conexiones)`}
                    >
                      <div className="flex flex-col items-center cursor-pointer group">
                        <div className={`p-1.5 rounded-full shadow-lg border transition-transform group-hover:scale-110 ${
                          isSelected
                            ? 'bg-amber-500 border-white text-slate-950 scale-110'
                            : stats.total > 50
                            ? 'bg-rose-600 border-white text-white'
                            : stats.total > 15
                            ? 'bg-blue-600 border-white text-white'
                            : 'bg-slate-700 border-slate-400 text-slate-200'
                        }`}>
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="mt-0.5 bg-slate-950/90 border border-slate-700 text-[10px] text-white px-1.5 py-0.2 rounded whitespace-nowrap font-mono shadow">
                          {tower.name.split('-')[0].trim()} ({stats.total})
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {targetRouteRecords.length > 0 && targetRouteRecords[currentStep] && (
                  <AdvancedMarker
                    position={{
                      lat: targetRouteRecords[currentStep].latitude,
                      lng: targetRouteRecords[currentStep].longitude
                    }}
                    title={`Paso ${currentStep + 1}: ${targetRouteRecords[currentStep].time}`}
                  >
                    <div className="bg-rose-600 text-white border-2 border-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs shadow-xl animate-bounce">
                      {currentStep + 1}
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>
          </div>
        ) : (
          /* VISTA 2: VISOR CARTOGRÁFICO TÁCTICO VECTORIAL GIS (Autónomo / Offline Seguro) */
          <div 
            className="flex-1 h-full w-full relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Controles Flotantes de Navegación del Visor Táctico */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded shadow-xl backdrop-blur">
              <button
                onClick={() => setTacticalZoom(prev => Math.min(prev + 0.25, 3))}
                title="Acercar (+)"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTacticalZoom(prev => Math.max(prev - 0.25, 0.75))}
                title="Alejar (-)"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTacticalZoom(1);
                  setTacticalPan({ x: 0, y: 0 });
                }}
                title="Restablecer Vista"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso Informativo del Modo Táctico Autónomo */}
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-2 backdrop-blur">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modo Cartográfico Vectorial Forense · Sin dependencias de API externa</span>
            </div>

            {/* Lienzo SVG Vectorial Táctico Georreferenciado */}
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `translate(${tacticalPan.x}px, ${tacticalPan.y}px) scale(${tacticalZoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <defs>
                {/* Cuadrícula Táctica de Fondo */}
                <pattern id="tactical-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.5" />
                  <circle cx="0" cy="0" r="1" fill="#334155" />
                </pattern>

                {/* Gradiente Cono de Azimut Normal */}
                <radialGradient id="azimuth-gradient" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </radialGradient>

                {/* Gradiente Cono de Azimut Seleccionado */}
                <radialGradient id="azimuth-selected-gradient" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              {/* Fondo y Grilla */}
              <rect width="1000" height="800" fill="#030712" />
              <rect width="1000" height="800" fill="url(#tactical-grid)" />

              {/* Río Bravo / Frontera Internacional (Línea de Norte) */}
              <path
                d="M 50 120 Q 250 150 450 140 T 750 200 T 980 240"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="4"
                strokeDasharray="8 4"
                strokeOpacity="0.7"
              />
              <text x="320" y="130" fill="#3b82f6" fontSize="9" fontFamily="monospace" opacity="0.6">
                RÍO BRAVO · LÍNEA FRONTERIZA MÉXICO / EE.UU. (EL PASO, TX)
              </text>

              {/* Vías Principales de Cd. Juárez (Vectores Referenciales) */}
              {/* Av. 16 de Septiembre / Centro */}
              <path d="M 280 180 L 450 230" stroke="#334155" strokeWidth="2" strokeOpacity="0.6" />
              {/* Av. Paseo Triunfo / Lincoln (Pronaf) */}
              <path d="M 400 210 L 520 280" stroke="#334155" strokeWidth="2.5" strokeOpacity="0.6" />
              <text x="460" y="240" fill="#64748b" fontSize="8" fontFamily="monospace">Av. Lincoln (Pronaf)</text>
              {/* Av. Gómez Morín */}
              <path d="M 500 270 L 680 430" stroke="#334155" strokeWidth="2" strokeOpacity="0.6" />
              <text x="590" y="340" fill="#64748b" fontSize="8" fontFamily="monospace">Av. Gómez Morín</text>
              {/* Av. de las Torres */}
              <path d="M 540 430 L 680 580" stroke="#334155" strokeWidth="2" strokeOpacity="0.6" />
              <text x="610" y="490" fill="#64748b" fontSize="8" fontFamily="monospace">Av. de las Torres</text>
              {/* Carretera Panamericana / Blvr. Zaragoza */}
              <path d="M 420 300 L 780 620" stroke="#334155" strokeWidth="2.5" strokeOpacity="0.6" />
              <text x="710" y="590" fill="#64748b" fontSize="8" fontFamily="monospace">Blvr. Zaragoza / Panamericana</text>

              {/* Etiquetas de Zonas Urbanas */}
              <text x="90" y="240" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONA ANAPRA</text>
              <text x="340" y="200" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">CENTRO HISTÓRICO</text>
              <text x="480" y="220" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONA PRONAF</text>
              <text x="600" y="300" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONA COMERCIAL GÓMEZ MORÍN</text>
              <text x="730" y="520" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">PARQUE IND. ZARAGOZA</text>
              <text x="830" y="660" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">RIBERAS DEL BRAVO</text>
              <text x="510" y="600" fill="#475569" fontSize="10" fontWeight="bold" fontFamily="monospace">AEROPUERTO CJS</text>

              {/* CAPA 1: CONOS DE AZIMUT (SECTORES DE RADIACIÓN DE ANTENAS) */}
              {showAzimuthCones && towers.map(tower => {
                const { x, y } = projectCoords(tower.latitude, tower.longitude);
                const isSelected = selectedTower?.id === tower.id;
                const radius = ((tower.rangeMeters || 1400) / 1000) * 45; // Escala proporcional
                const path = generateAzimuthSectorPath(x, y, radius, tower.azimuth, tower.beamWidth || 65);

                return (
                  <path
                    key={`cone-${tower.id}`}
                    d={path}
                    fill={isSelected ? 'url(#azimuth-selected-gradient)' : 'url(#azimuth-gradient)'}
                    stroke={isSelected ? '#F59E0B' : '#3B82F6'}
                    strokeWidth={isSelected ? '2' : '1'}
                    strokeOpacity={isSelected ? '0.9' : '0.5'}
                    className="pointer-events-none transition-all duration-300"
                  />
                );
              })}

              {/* CAPA 2: POLILÍNEA DE RUTA DEL SOSPECHOSO / INVESTIGADO */}
              {targetRouteRecords.length > 1 && (() => {
                const points = targetRouteRecords.slice(0, currentStep + 1).map(r => {
                  const { x, y } = projectCoords(r.latitude, r.longitude);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                  />
                );
              })()}

              {/* CAPA 3: ANTENAS CELULARES INTERACTIVAS */}
              {towers.map(tower => {
                const { x, y } = projectCoords(tower.latitude, tower.longitude);
                const stats = towerConnectionStats[tower.id] || { total: 0, numbers: new Set() };
                const isSelected = selectedTower?.id === tower.id;

                return (
                  <g
                    key={`tower-${tower.id}`}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedTower(tower)}
                    className="cursor-pointer group"
                  >
                    {/* Anillo de pulso para antenas activas */}
                    {stats.total > 0 && (
                      <circle
                        r={isSelected ? 18 : 14}
                        fill="none"
                        stroke={isSelected ? '#F59E0B' : '#3B82F6'}
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Nodo central de la torre */}
                    <circle
                      r={isSelected ? 12 : 9}
                      fill={
                        isSelected
                          ? '#F59E0B'
                          : stats.total > 50
                          ? '#DC2626'
                          : stats.total > 15
                          ? '#2563EB'
                          : '#475569'
                      }
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Etiqueta de la torre */}
                    <rect
                      x="-45"
                      y="14"
                      width="90"
                      height="18"
                      rx="3"
                      fill="#030712"
                      fillOpacity="0.85"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="26"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {tower.id} ({stats.total})
                    </text>
                  </g>
                );
              })}

              {/* CAPA 4: MARCADOR DEL PASO DE RUTA ACTUAL */}
              {targetRouteRecords.length > 0 && targetRouteRecords[currentStep] && (() => {
                const activeRecord = targetRouteRecords[currentStep];
                const { x, y } = projectCoords(activeRecord.latitude, activeRecord.longitude);

                return (
                  <g transform={`translate(${x}, ${y})`}>
                    <circle r="16" fill="#EF4444" fillOpacity="0.3" className="animate-ping" />
                    <circle r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x="0"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="extrabold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {currentStep + 1}
                    </text>
                    <rect
                      x="-60"
                      y="-28"
                      width="120"
                      height="16"
                      rx="3"
                      fill="#991B1B"
                      stroke="#F87171"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-17"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {activeRecord.time} · {activeRecord.durationSeconds}s
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        )}

        {/* Panel Lateral Desplegable: Detalle Forense de la Antena Seleccionada */}
        {selectedTower && (
          <aside className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-30 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded font-bold">
                    CELDA {selectedTower.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedTower.operator}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{selectedTower.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{selectedTower.address}</p>
              </div>
              <button
                onClick={() => setSelectedTower(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Ficha Geoespacial */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Azimut Sectorial</span>
                  <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    {selectedTower.azimuth}° (Sector {selectedTower.beamWidth || 65}°)
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Radio Estimado</span>
                  <span className="text-white font-bold mt-0.5 block">
                    ~ {selectedTower.rangeMeters || 1200} metros
                  </span>
                </div>
              </div>

              {/* Resumen de Conexiones */}
              <div className="p-3 rounded bg-blue-950/30 border border-blue-900/50 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-300">Conexiones Registradas:</span>
                  <span className="text-white font-bold text-sm">
                    {selectedTowerConnections.length} eventos
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono mt-1 text-[11px] text-slate-400">
                  <span>Números Únicos Enganchados:</span>
                  <span className="text-blue-300 font-semibold">
                    {new Set(selectedTowerConnections.map(c => c.numberA)).size}
                  </span>
                </div>
              </div>

              {/* Lista de Números Conectados a esta Celda */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Eventos en esta Antena
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs">
                  {selectedTowerConnections.length === 0 ? (
                    <p className="text-slate-500 text-xs">Sin conexiones en la fecha seleccionada.</p>
                  ) : (
                    selectedTowerConnections.map((conn) => {
                      const label = labels.find(l => l.phoneNumber.replace(/\D/g, '') === conn.numberA.replace(/\D/g, ''));
                      return (
                        <div
                          key={conn.id}
                          className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{conn.numberA}</span>
                              {label && (
                                <span className="text-[10px] text-slate-400 font-sans">
                                  ({label.label})
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {conn.date} {conn.time} · {conn.eventType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-300">
                            {conn.durationSeconds}s
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Pie del drawer con coordenadas */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Coordenadas Juárez:</span>
              <span>{selectedTower.latitude.toFixed(4)}, {selectedTower.longitude.toFixed(4)}</span>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Opcional de Configuración de Clave de Google Maps */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Configuración Opcional de Google Maps</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              El visor cartográfico táctico funciona de forma 100% autónoma sin requerir clave externa. Si cuentas con una clave propia de Google Maps Platform, puedes ingresarla aquí para activar las capas satelitales oficiales.
            </p>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={keyInputValue}
              onChange={(e) => setKeyInputValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cerrar (Continuar en Modo Autónomo)
              </button>
              <button
                onClick={handleSaveCustomKey}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded"
              >
                Guardar Clave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
