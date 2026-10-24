import React, { useState, useEffect, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
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
  Filter, 
  Calendar, 
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';

interface GoogleMapsAntennasViewProps {
  towers: CellTower[];
  records: CallDetailRecord[];
  labels: PhoneLabel[];
  selectedTargetPhone?: string;
  focusedTowerId?: string;
  onOpenLabelModal: (phone: string) => void;
}

// Subcomponente para renderizar polilíneas de ruta y polígonos de conos de azimut directamente en la instancia de Google Maps
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

  // Función matemática para proyectar punto a partir de distancia y ángulo (fórmula del gran círculo)
  const computeDestinationPoint = (
    lat: number,
    lng: number,
    distanceMeters: number,
    bearingDegrees: number
  ) => {
    const R = 6371000; // Radio de la Tierra en metros
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

  // Renderizar conos de azimut para cada antena celular
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    // Limpiar polígonos previos
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
        strokeOpacity: isSelected ? 0.9 : 0.45,
        strokeWeight: isSelected ? 2 : 1,
        fillColor: isSelected ? '#F59E0B' : '#1D4ED8',
        fillOpacity: isSelected ? 0.35 : 0.12,
        map
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach(p => p.setMap(null));
    };
  }, [map, towers, showAzimuthCones, selectedTower]);

  // Renderizar ruta cronológica trazada
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
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  // Coordenadas centrales de Ciudad Juárez, Chihuahua
  const defaultCenter = { lat: 31.6904, lng: -106.4245 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  // Estados interactivos
  const [showAzimuthCones, setShowAzimuthCones] = useState<boolean>(true);
  const [selectedTower, setSelectedTower] = useState<CellTower | null>(null);
  const [activeNumberForRoute, setActiveNumberForRoute] = useState<string>(selectedTargetPhone);
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');

  // Centrar si viene una torre enfocada
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
    const dates = Array.from(new Set(records.map(r => r.date))).sort();
    return dates;
  }, [records]);

  // Registros filtrados por fecha
  const filteredRecords = useMemo(() => {
    if (selectedDateFilter === 'ALL') return records;
    return records.filter(r => r.date === selectedDateFilter);
  }, [records, selectedDateFilter]);

  // Registros que corresponden a la ruta del número objetivo seleccionado
  const targetRouteRecords = useMemo(() => {
    const clean = activeNumberForRoute.replace(/\D/g, '');
    return filteredRecords
      .filter(r => r.numberA.replace(/\D/g, '') === clean || r.numberB.replace(/\D/g, '') === clean)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredRecords, activeNumberForRoute]);

  // Conteo de conexiones por antena
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

  // Conexiones específicas de la torre actualmente seleccionada
  const selectedTowerConnections = useMemo(() => {
    if (!selectedTower) return [];
    return filteredRecords.filter(r => r.towerId === selectedTower.id);
  }, [selectedTower, filteredRecords]);

  // Temporizador de reproducción paso a paso de la ruta
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Barra de Controles Georreferenciados Superior */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Red Celular Cd. Juárez</span>
          </div>
          <span className="text-slate-600">|</span>

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

        {/* Controles de Trazado de Ruta de Interés */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Ruta del Investigado:</span>
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

      {/* Contenedor Principal: Mapa Oficial Google Maps + Panel Lateral de Antena */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Mapa de Google Maps (100% de alto y ancho) */}
        <div className="flex-1 h-full w-full relative">
          <APIProvider apiKey={apiKey}>
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
              {/* Capa de Geometrías (Conos de Azimut y Rutas Vectoriales) */}
              <MapOverlaysRenderer
                towers={towers}
                showAzimuthCones={showAzimuthCones}
                routeRecords={targetRouteRecords}
                currentPlaybackStep={currentStep}
                selectedTower={selectedTower}
              />

              {/* Marcadores Avanzados para las Torres de Radiocomunicación */}
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

              {/* Marcador del paso activo de la ruta con indicación numérica */}
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

        {/* Panel Lateral Desplegable: Detalle Forense de la Antena Seleccionada */}
        {selectedTower && (
          <aside className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl z-20 overflow-hidden">
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
                className="text-slate-400 hover:text-white p-1"
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

              {/* Lista de Números que se Conectaron a esta Celda */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Números Conectados a esta Antena
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs">
                  {selectedTowerConnections.length === 0 ? (
                    <p className="text-slate-400 text-xs">Sin conexiones en la fecha seleccionada.</p>
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

            {/* Pie del drawer */}
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
