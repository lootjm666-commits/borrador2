import React from 'react';
import { CallDetailRecord, CellTower, InvestigationCase, PhoneLabel } from '../types/telecom';
import { 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  Radio,
  Network
} from 'lucide-react';

interface DashboardViewProps {
  activeCase: InvestigationCase;
  records: CallDetailRecord[];
  towers: CellTower[];
  labels: PhoneLabel[];
  onSelectTab: (tab: any) => void;
  onFilterByNumber: (num: string) => void;
  onFilterByTower: (towerId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeCase,
  records,
  towers,
  labels,
  onSelectTab,
  onFilterByNumber,
  onFilterByTower
}) => {
  // Estadísticas clave
  const totalCalls = records.filter(r => r.eventType.startsWith('VOZ')).length;
  const totalSMS = records.filter(r => r.eventType.startsWith('SMS')).length;
  const totalData = records.filter(r => r.eventType === 'DATOS_LTE').length;
  const criticalCalls = records.filter(r => r.notes?.toLowerCase().includes('rescate') || r.notes?.toLowerCase().includes('exigencia')).length;

  // Conexiones por antena
  const towerCounts: Record<string, number> = {};
  records.forEach(r => {
    towerCounts[r.towerId] = (towerCounts[r.towerId] || 0) + 1;
  });

  const sortedTowers = towers
    .map(t => ({
      ...t,
      count: towerCounts[t.id] || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Números más activos
  const numberCounts: Record<string, { total: number; duration: number; type: string }> = {};
  records.forEach(r => {
    const target = r.numberA === activeCase.primaryTargetNumber ? r.numberB : r.numberA;
    if (!numberCounts[target]) {
      numberCounts[target] = { total: 0, duration: 0, type: r.eventType };
    }
    numberCounts[target].total += 1;
    numberCounts[target].duration += r.durationSeconds;
  });

  const topNumbers = Object.entries(numberCounts)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 6);

  // Distribución horaria
  const hourDistribution = Array(24).fill(0);
  records.forEach(r => {
    const hour = parseInt(r.time.split(':')[0], 10);
    if (!isNaN(hour) && hour >= 0 && hour < 24) {
      hourDistribution[hour]++;
    }
  });
  const maxHourCount = Math.max(...hourDistribution, 1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado del caso institucional */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
            <span className="font-mono text-blue-400 font-semibold">{activeCase.caseNumber}</span>
            <span>·</span>
            <span>{activeCase.unit}</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">ESTADO: {activeCase.status}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{activeCase.title}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {activeCase.summary}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => onSelectTab('vinculos-pdf')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Resultados de PDFs (UAYC/i2)</span>
          </button>
          <button
            onClick={() => onSelectTab('mapa')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver Mapa en Vivo</span>
          </button>
          <button
            onClick={() => onSelectTab('importar')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
          >
            <span>Importar Nueva Sábana</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Registros Sábana</span>
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {records.length.toLocaleString('es-MX')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalCalls} llamadas · {totalSMS} SMS · {totalData} datos
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Comunicaciones Críticas</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {criticalCalls}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Llamadas identificadas de exigencia o rescate
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Antenas en Cd. Juárez</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {Object.keys(towerCounts).length} <span className="text-xs font-normal text-slate-400">/ {towers.length} registradas</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Corredores Pronaf, Anapra, Gómez Morín, Zaragoza
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Números Etiquetados</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {labels.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Sospechosos, familiares, víctimas, intermediarios
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Conexiones por Antena + Top Contactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antenas con mayor actividad celular */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Celdas Celulares Más Concurridas</h2>
              <p className="text-xs text-slate-400">Conexiones detectadas en Ciudad Juárez</p>
            </div>
            <button
              onClick={() => onSelectTab('mapa')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Ver en mapa →
            </button>
          </div>

          <div className="space-y-3">
            {sortedTowers.map((tower, idx) => {
              const percentage = Math.round((tower.count / records.length) * 100);
              return (
                <div
                  key={tower.id}
                  onClick={() => {
                    onFilterByTower(tower.id);
                    onSelectTab('mapa');
                  }}
                  className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 hover:border-blue-600/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 w-5 text-right font-medium">{idx + 1}.</span>
                      <span className="font-semibold text-slate-200">{tower.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                        {tower.operator}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white tabular-nums">{tower.count} reg</span>
                      <span className="font-mono text-[11px] text-slate-400 w-9 text-right">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(percentage * 2.5, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Azimut: {tower.azimuth}°</span>
                    <span>{tower.latitude.toFixed(4)}, {tower.longitude.toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Números Frecuentes y Etiquetado */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Números Frecuentes Vinculados</h2>
              <p className="text-xs text-slate-400">Intercambio de comunicaciones con el objetivo principal</p>
            </div>
            <button
              onClick={() => onSelectTab('etiquetas')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Gestionar etiquetas →
            </button>
          </div>

          <div className="space-y-2.5">
            {topNumbers.map(([num, data]) => {
              const label = labels.find(l => l.phoneNumber.replace(/\D/g, '') === num.replace(/\D/g, ''));
              return (
                <div
                  key={num}
                  onClick={() => {
                    onFilterByNumber(num);
                    onSelectTab('numero');
                  }}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800/80 hover:border-blue-600/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: label?.color || '#94A3B8' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tabular-nums">{num}</span>
                        {label && (
                          <span className="text-[11px] font-medium text-slate-300">
                            · {label.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {label?.category ? `Categoría: ${label.category.toUpperCase()}` : 'Sin clasificar'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
                      {data.total} eventos
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {Math.round(data.duration / 60)} min acum.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Distribución de Actividad por Franja Horaria (24 horas) */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Patrón de Actividad por Horario (00:00 - 23:59)</h2>
            <p className="text-xs text-slate-400">Identificación de picos en comunicaciones extorsivas y nocturnas</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Pico máximo: {Math.max(...hourDistribution)} eventos</span>
          </div>
        </div>

        <div className="grid grid-cols-24 gap-1 items-end h-28 pt-4">
          {hourDistribution.map((count, hour) => {
            const heightPercent = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
            const isNight = hour >= 22 || hour < 6;
            return (
              <div key={hour} className="flex flex-col items-center h-full justify-end group relative">
                <div 
                  className={`w-full rounded-t transition-all ${
                    isNight 
                      ? 'bg-rose-500/80 group-hover:bg-rose-400' 
                      : 'bg-blue-600/80 group-hover:bg-blue-400'
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                <span className="text-[9px] font-mono text-slate-400 mt-1">
                  {hour % 3 === 0 ? `${hour}h` : ''}
                </span>

                {/* Tooltip con valores reales */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-20">
                  <div className="bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap font-mono">
                    {hour.toString().padStart(2, '0')}:00 hrs · {count} eventos
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-blue-600" />
              <span>Horario diurno</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Franja nocturna / crítica (22:00 a 06:00)</span>
            </div>
          </div>
          <span className="font-mono">Zona Horaria: Mountain Standard Time (MST / UTC-7)</span>
        </div>
      </div>
    </div>
  );
};
