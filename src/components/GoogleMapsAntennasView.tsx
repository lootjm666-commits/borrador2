/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de Análisis Geoespacial y Cartografía Forense de Celdas Telefónicas
 * Basado en Leaflet (con capas Satelital, CartoDB Dark Matter y OpenStreetMap)
 * y Visor Vectorial GIS Táctico Autónomo. Sin restricciones de cuota ni APIs externas.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
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
  Shield,
  Satellite,
  SunMedium,
  Moon,
  Crosshair
} from 'lucide-react';

interface GoogleMapsAntennasViewProps {
  towers: CellTower[];
  records: CallDetailRecord[];
  labels: PhoneLabel[];
  selectedTargetPhone?: string;
  focusedTowerId?: string;
  onOpenLabelModal: (phone: string) => void;
}

// Bounding Box y centro de Ciudad Juárez, Chihuahua
const JUAREZ_CENTER: [number, number] = [31.6904, -106.4245];
const JUAREZ_BOUNDS = {
  minLat: 31.5500,
  maxLat: 31.8100,
  minLng: -106.5700,
  maxLng: -106.2500
};

// Definición de capas base de mapas para Leaflet
type MapLayerType = 'satellite' | 'dark' | 'streets';

const MAP_TILE_CONFIGS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number; name: string }> = {
  satellite: {
    name: 'Satelital Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; High-Resolution Imagery',
    maxZoom: 19
  },
  dark: {
    name: 'Táctico Oscuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO Dark Matter',
    maxZoom: 20
  },
  streets: {
    name: 'Callejero OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
};

/**
 * Cálculo geodésico de punto de destino dado azimut y distancia en metros
 */
const computeDestinationPoint = (
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDegrees: number
): [number, number] => {
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

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
};

export const GoogleMapsAntennasView: React.FC<GoogleMapsAntennasViewProps> = ({
  towers,
  records,
  labels,
  selectedTargetPhone = '656-789-2041',
  focusedTowerId,
  onOpenLabelModal
}) => {
  // Motor cartográfico activo: 'leaflet' o 'vector-svg'
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'vector-svg'>('leaflet');
  const [activeTileLayer, setActiveTileLayer] = useState<MapLayerType>('satellite');

  // Referencias para Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlaysGroupRef = useRef<L.LayerGroup | null>(null);

  // Estados interactivos
  const [showAzimuthCones, setShowAzimuthCones] = useState<boolean>(true);
  const [selectedTower, setSelectedTower] = useState<CellTower | null>(null);
  const [activeNumberForRoute, setActiveNumberForRoute] = useState<string>(selectedTargetPhone);
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');

  // Estados del visor cartográfico táctico vectorial alternativo
  const [tacticalZoom, setTacticalZoom] = useState<number>(1);
  const [tacticalPan, setTacticalPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lista de fechas únicas en la sábana
  const availableDates = useMemo(() => {
    return Array.from(new Set(records.map(r => r.date))).sort();
  }, [records]);

  // Registros filtrados por fecha
  const filteredRecords = useMemo(() => {
    if (selectedDateFilter === 'ALL') return records;
    return records.filter(r => r.date === selectedDateFilter);
  }, [records, selectedDateFilter]);

  // Registros de la ruta activa del investigado
  const targetRouteRecords = useMemo(() => {
    const clean = activeNumberForRoute.replace(/\D/g, '');
    return filteredRecords
      .filter(r => r.numberA.replace(/\D/g, '') === clean || r.numberB.replace(/\D/g, '') === clean)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredRecords, activeNumberForRoute]);

  // Estadísticas de conexión por antena
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

  // Enfoque inicial de antena si se solicita desde otra vista
  useEffect(() => {
    if (focusedTowerId) {
      const t = towers.find(tower => tower.id === focusedTowerId);
      if (t) {
        setSelectedTower(t);
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([t.latitude, t.longitude], 14, { duration: 1 });
        }
      }
    }
  }, [focusedTowerId, towers]);

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

  // 1. Inicialización de Leaflet
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: JUAREZ_CENTER,
        zoom: 12,
        minZoom: 9,
        maxZoom: 19,
        zoomControl: false
      });

      // Controles de zoom abajo a la derecha
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Capa base
      const cfg = MAP_TILE_CONFIGS[activeTileLayer];
      const tile = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        maxZoom: cfg.maxZoom,
        subdomains: activeTileLayer === 'dark' ? 'abcd' : 'abc'
      }).addTo(map);
      tileLayerRef.current = tile;

      // Grupo de capas de conos, torres y polilíneas
      const overlays = L.layerGroup().addTo(map);
      overlaysGroupRef.current = overlays;

      leafletMapRef.current = map;

      // Invalidate size después del render inicial
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      // Defer cleanup or leave instance intact when staying in view
    };
  }, [mapEngine]);

  // 2. Cambio de capa base en Leaflet (Satelital / Dark / Streets)
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = MAP_TILE_CONFIGS[activeTileLayer];
    const newTile = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: activeTileLayer === 'dark' ? 'abcd' : 'abc'
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeTileLayer]);

  // 3. Renderizado de Elementos en Leaflet (Antenas, Conos y Rutas)
  useEffect(() => {
    if (!leafletMapRef.current || !overlaysGroupRef.current) return;
    const group = overlaysGroupRef.current;
    group.clearLayers();

    // A. Conos de Azimut Sectoriales
    if (showAzimuthCones) {
      towers.forEach(tower => {
        const isSelected = selectedTower?.id === tower.id;
        const center: [number, number] = [tower.latitude, tower.longitude];
        const beamWidth = tower.beamWidth || 65;
        const range = tower.rangeMeters || 1200;
        const startAngle = tower.azimuth - beamWidth / 2;
        const endAngle = tower.azimuth + beamWidth / 2;

        const pathCoords: [number, number][] = [center];
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
          const currentAngle = startAngle + (i / steps) * (endAngle - startAngle);
          pathCoords.push(computeDestinationPoint(center[0], center[1], range, currentAngle));
        }
        pathCoords.push(center);

        const sectorPolygon = L.polygon(pathCoords, {
          color: isSelected ? '#F59E0B' : '#3B82F6',
          weight: isSelected ? 2 : 1,
          opacity: isSelected ? 0.9 : 0.6,
          fillColor: isSelected ? '#F59E0B' : '#3B82F6',
          fillOpacity: isSelected ? 0.35 : 0.15
        });

        sectorPolygon.on('click', () => {
          setSelectedTower(tower);
        });

        sectorPolygon.addTo(group);
      });
    }

    // B. Polilínea de la Ruta Activa
    if (targetRouteRecords.length > 1) {
      const visibleRoute = targetRouteRecords.slice(0, currentStep + 1);
      const latLngs: [number, number][] = visibleRoute.map(r => [r.latitude, r.longitude]);

      const polyline = L.polyline(latLngs, {
        color: '#EF4444',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      });
      polyline.addTo(group);
    }

    // C. Marcadores de Antenas Celulares
    towers.forEach(tower => {
      const stats = towerConnectionStats[tower.id] || { total: 0, numbers: new Set() };
      const isSelected = selectedTower?.id === tower.id;
      const count = stats.total;

      const bgColor = isSelected
        ? '#F59E0B'
        : count > 50
        ? '#DC2626'
        : count > 15
        ? '#2563EB'
        : '#475569';

      const iconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 9999px;
            background-color: ${bgColor};
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
            transition: transform 0.2s;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
            </svg>
          </div>
          <div style="
            margin-top: 2px;
            background-color: rgba(3, 7, 18, 0.92);
            border: 1px solid #334155;
            color: #FFFFFF;
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
            padding: 1px 6px;
            border-radius: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
          ">
            ${tower.name.split('-')[0].trim()} (${count})
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'antenna-leaflet-marker',
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([tower.latitude, tower.longitude], {
        icon: markerIcon,
        title: `${tower.name} (${count} eventos)`
      });

      marker.on('click', () => {
        setSelectedTower(tower);
      });

      marker.addTo(group);
    });

    // D. Marcador del Paso Actual de la Ruta
    if (targetRouteRecords.length > 0 && targetRouteRecords[currentStep]) {
      const activeRecord = targetRouteRecords[currentStep];

      const stepIconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background-color: #DC2626;
            border: 2px solid #FFFFFF;
            color: #FFFFFF;
            font-weight: 800;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 18px rgba(220, 38, 38, 0.9);
          ">
            ${currentStep + 1}
          </div>
          <div style="
            margin-top: 3px;
            background-color: #991B1B;
            border: 1px solid #F87171;
            color: #FFFFFF;
            font-size: 9px;
            font-family: monospace;
            font-weight: bold;
            padding: 1px 6px;
            border-radius: 3px;
            white-space: nowrap;
          ">
            ${activeRecord.time} · ${activeRecord.durationSeconds}s
          </div>
        </div>
      `;

      const stepIcon = L.divIcon({
        className: 'route-step-marker',
        html: stepIconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const stepMarker = L.marker([activeRecord.latitude, activeRecord.longitude], {
        icon: stepIcon,
        zIndexOffset: 1000
      });

      stepMarker.addTo(group);
    }
  }, [towers, showAzimuthCones, selectedTower, targetRouteRecords, currentStep, towerConnectionStats]);

  // Centrar Leaflet al seleccionar antena o paso de ruta
  useEffect(() => {
    if (!leafletMapRef.current) return;
    if (selectedTower) {
      leafletMapRef.current.panTo([selectedTower.latitude, selectedTower.longitude], { animate: true });
    }
  }, [selectedTower]);

  // Re-ajustar tamaño de Leaflet si cambia el tamaño o panel
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 200);
    }
  }, [selectedTower, mapEngine]);

  // Funciones de proyección para el Visor Vectorial SVG Alternativo
  const projectCoords = (lat: number, lng: number, width: number = 1000, height: number = 800) => {
    const { minLat, maxLat, minLng, maxLng } = JUAREZ_BOUNDS;
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  const generateAzimuthSectorPath = (
    centerX: number,
    centerY: number,
    radius: number,
    azimuthDeg: number,
    beamWidthDeg: number = 65
  ) => {
    const startAngle = (azimuthDeg - beamWidthDeg / 2 - 90) * (Math.PI / 180);
    const endAngle = (azimuthDeg + beamWidthDeg / 2 - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = beamWidthDeg > 180 ? 1 : 0;
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 select-none">
      {/* Barra Superior de Control Geoespacial (Leaflet y Forense) */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Cartografía Forense Juárez</span>
            <span className="sm:hidden">Celdas Juárez</span>
          </div>

          {/* Selector de Motor de Mapa */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded text-[11px] font-mono">
            <button
              onClick={() => setMapEngine('leaflet')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                mapEngine === 'leaflet'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Leaflet</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">Libre</span>
            </button>
            <button
              onClick={() => setMapEngine('vector-svg')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapEngine === 'vector-svg'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visor Táctico SVG
            </button>
          </div>

          {/* Selector de Capas de Leaflet */}
          {mapEngine === 'leaflet' && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded text-[11px] font-mono">
              <button
                onClick={() => setActiveTileLayer('satellite')}
                title="Capa Satelital de Alta Resolución"
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeTileLayer === 'satellite'
                    ? 'bg-emerald-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Satellite className="w-3 h-3" />
                <span className="hidden sm:inline">Satelital</span>
              </button>
              <button
                onClick={() => setActiveTileLayer('dark')}
                title="Capa Táctica Oscura (CartoDB Dark Matter)"
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeTileLayer === 'dark'
                    ? 'bg-slate-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span className="hidden sm:inline">Oscuro</span>
              </button>
              <button
                onClick={() => setActiveTileLayer('streets')}
                title="Capa Callejera de OpenStreetMap"
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeTileLayer === 'streets'
                    ? 'bg-blue-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SunMedium className="w-3 h-3" />
                <span className="hidden sm:inline">Calles</span>
              </button>
            </div>
          )}

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Selector de Fecha */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                setCurrentStep(0);
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-white py-1 px-2 rounded font-mono"
            >
              <option value="ALL">Todas las fechas</option>
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
            <span className="hidden md:inline">Azimut ({showAzimuthCones ? 'Visibles' : 'Ocultos'})</span>
            <span className="md:hidden">Azimut</span>
          </button>
        </div>

        {/* Controles de Trazado de Ruta del Investigado */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 hidden sm:inline">Ruta:</span>
          <select
            value={activeNumberForRoute}
            onChange={(e) => {
              setActiveNumberForRoute(e.target.value);
              setCurrentStep(0);
              setIsPlayingRoute(false);
            }}
            className="bg-slate-950 border border-slate-700 text-xs text-white py-1 px-2 rounded font-mono font-bold max-w-[170px] truncate"
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
              <span className="hidden sm:inline">{isPlayingRoute ? 'Pausar' : 'Reproducir'}</span>
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
            {targetRouteRecords.length > 0 ? currentStep + 1 : 0}/{targetRouteRecords.length}
          </span>
        </div>
      </div>

      {/* Contenedor Principal del Mapa */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* VISTA 1: MOTOR LEAFLET (Satelital, Táctico Oscuro y OSM) */}
        {mapEngine === 'leaflet' && (
          <div className="flex-1 h-full w-full relative">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Botón flotante para centrar en Juárez */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  leafletMapRef.current?.flyTo(JUAREZ_CENTER, 12, { duration: 1 });
                }}
                title="Centrar en Ciudad Juárez"
                className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white rounded shadow-xl backdrop-blur flex items-center gap-1.5 text-xs font-mono"
              >
                <Crosshair className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Centrar Juárez</span>
              </button>
            </div>

            {/* Badge de Estado del Motor */}
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-2 backdrop-blur">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Leaflet v1.9 · Esri Satelital / CartoDB · Sin límites de cuota</span>
              <span className="sm:hidden">Leaflet Satelital</span>
            </div>
          </div>
        )}

        {/* VISTA 2: VISOR CARTOGRÁFICO TÁCTICO VECTORIAL GIS (Autónomo SVG) */}
        {mapEngine === 'vector-svg' && (
          <div 
            className="flex-1 h-full w-full relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - tacticalPan.x, y: e.clientY - tacticalPan.y });
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              setTacticalPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* Controles Flotantes del Visor Vectorial */}
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
                <pattern id="tactical-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.5" />
                  <circle cx="0" cy="0" r="1" fill="#334155" />
                </pattern>
                <radialGradient id="azimuth-gradient" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </radialGradient>
                <radialGradient id="azimuth-selected-gradient" cx="0%" cy="0%" r="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              <rect width="1000" height="800" fill="#030712" />
              <rect width="1000" height="800" fill="url(#tactical-grid)" />

              {/* Río Bravo */}
              <path
                d="M 50 120 Q 250 150 450 140 T 750 200 T 980 240"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="4"
                strokeDasharray="8 4"
                strokeOpacity="0.7"
              />
              <text x="320" y="130" fill="#3b82f6" fontSize="9" fontFamily="monospace" opacity="0.6">
                RÍO BRAVO · LÍNEA FRONTERIZA MÉXICO / EE.UU.
              </text>

              {/* Vías urbanas Juárez */}
              <path d="M 280 180 L 450 230" stroke="#334155" strokeWidth="2" strokeOpacity="0.6" />
              <path d="M 400 210 L 520 280" stroke="#334155" strokeWidth="2.5" strokeOpacity="0.6" />
              <text x="460" y="240" fill="#64748b" fontSize="8" fontFamily="monospace">Av. Lincoln (Pronaf)</text>
              <path d="M 500 270 L 680 430" stroke="#334155" strokeWidth="2" strokeOpacity="0.6" />
              <text x="590" y="340" fill="#64748b" fontSize="8" fontFamily="monospace">Av. Gómez Morín</text>

              {/* Conos de Azimut */}
              {showAzimuthCones && towers.map(tower => {
                const { x, y } = projectCoords(tower.latitude, tower.longitude);
                const isSelected = selectedTower?.id === tower.id;
                const radius = ((tower.rangeMeters || 1400) / 1000) * 45;
                const path = generateAzimuthSectorPath(x, y, radius, tower.azimuth, tower.beamWidth || 65);

                return (
                  <path
                    key={`cone-${tower.id}`}
                    d={path}
                    fill={isSelected ? 'url(#azimuth-selected-gradient)' : 'url(#azimuth-gradient)'}
                    stroke={isSelected ? '#F59E0B' : '#3B82F6'}
                    strokeWidth={isSelected ? '2' : '1'}
                    strokeOpacity={isSelected ? '0.9' : '0.5'}
                    className="pointer-events-none"
                  />
                );
              })}

              {/* Polilínea de Ruta */}
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
                  />
                );
              })()}

              {/* Antenas */}
              {towers.map(tower => {
                const { x, y } = projectCoords(tower.latitude, tower.longitude);
                const stats = towerConnectionStats[tower.id] || { total: 0, numbers: new Set() };
                const isSelected = selectedTower?.id === tower.id;

                return (
                  <g
                    key={`tower-${tower.id}`}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedTower(tower)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={isSelected ? 12 : 9}
                      fill={isSelected ? '#F59E0B' : stats.total > 50 ? '#DC2626' : stats.total > 15 ? '#2563EB' : '#475569'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x="0"
                      y="24"
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
            </svg>
          </div>
        )}

        {/* Panel Lateral / Bottom Sheet Desplegable: Detalle Forense de la Antena Seleccionada */}
        {selectedTower && (
          <aside className="fixed inset-x-0 bottom-14 md:bottom-0 max-h-[75vh] md:max-h-none md:static md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-30 overflow-hidden rounded-t-xl md:rounded-none">
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
    </div>
  );
};
