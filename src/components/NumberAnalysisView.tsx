import React, { useState, useMemo } from 'react';
import { CallDetailRecord, CellTower, PhoneLabel } from '../types/telecom';
import { 
  Phone, 
  Clock, 
  MapPin, 
  Smartphone, 
  Tag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MessageSquare, 
  Compass, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NumberAnalysisViewProps {
  initialPhoneNumber?: string;
  records: CallDetailRecord[];
  towers: CellTower[];
  labels: PhoneLabel[];
  onOpenLabelModal: (phone: string) => void;
  onNavigateToMapWithNumber: (phone: string) => void;
}

export const NumberAnalysisView: React.FC<NumberAnalysisViewProps> = ({
  initialPhoneNumber = '656-789-2041',
  records,
  towers,
  labels,
  onOpenLabelModal,
  onNavigateToMapWithNumber
}) => {
  const [selectedNumber, setSelectedNumber] = useState<string>(initialPhoneNumber);

  // Lista de todos los números presentes en la sábana
  const availableNumbers = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      set.add(r.numberA);
      set.add(r.numberB);
    });
    return Array.from(set).sort();
  }, [records]);

  // Registros donde participa este número
  const phoneRecords = useMemo(() => {
    const clean = selectedNumber.replace(/\D/g, '');
    return records.filter(
      r => r.numberA.replace(/\D/g, '') === clean || r.numberB.replace(/\D/g, '') === clean
    );
  }, [records, selectedNumber]);

  // Etiqueta del número
  const phoneLabel = useMemo(() => {
    const clean = selectedNumber.replace(/\D/g, '');
    return labels.find(l => l.phoneNumber.replace(/\D/g, '') === clean);
  }, [labels, selectedNumber]);

  // Estadísticas
  const outgoingCalls = phoneRecords.filter(r => r.numberA === selectedNumber && r.eventType.startsWith('VOZ')).length;
  const incomingCalls = phoneRecords.filter(r => r.numberB === selectedNumber && r.eventType.startsWith('VOZ')).length;
  const smsCount = phoneRecords.filter(r => r.eventType.startsWith('SMS')).length;
  const totalSeconds = phoneRecords.reduce((acc, r) => acc + r.durationSeconds, 0);

  // IMEIs utilizados
  const associatedImeis = Array.from(new Set(phoneRecords.map(r => r.imei))).filter(Boolean);

  // Top interlocutores
  const interlocutors = useMemo(() => {
    const counts: Record<string, { count: number; duration: number }> = {};
    phoneRecords.forEach(r => {
      const other = r.numberA === selectedNumber ? r.numberB : r.numberA;
      if (!counts[other]) counts[other] = { count: 0, duration: 0 };
      counts[other].count += 1;
      counts[other].duration += r.durationSeconds;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 8);
  }, [phoneRecords, selectedNumber]);

  // Antenas más frecuentes
  const towerStats = useMemo(() => {
    const counts: Record<string, number> = {};
    phoneRecords.forEach(r => {
      counts[r.towerId] = (counts[r.towerId] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const tower = towers.find(t => t.id === id);
        return {
          id,
          name: tower?.name || id,
          operator: tower?.operator || 'TELCEL',
          azimuth: tower?.azimuth || 0,
          count,
          percentage: Math.round((count / (phoneRecords.length || 1)) * 100)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [phoneRecords, towers]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Selector de Número e Información de Identidad */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
              Módulo de Inteligencia Telefónica
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>Ficha Forense de la Línea</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-blue-400">{selectedNumber}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 py-2 px-3 rounded focus:outline-none focus:border-blue-500 font-mono"
            >
              {availableNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <button
              onClick={() => onOpenLabelModal(selectedNumber)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{phoneLabel ? 'Editar' : 'Etiquetar'}</span>
            </button>
            <button
              onClick={() => onNavigateToMapWithNumber(selectedNumber)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Trazar Ruta</span>
            </button>
          </div>
        </div>

        {/* Resumen de Identidad de la Línea */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Etiqueta Asignada</span>
            <div className="mt-1 flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: phoneLabel?.color || '#94A3B8' }} 
              />
              <span className="font-bold text-white truncate">
                {phoneLabel?.label || 'Sin clasificar'}
              </span>
            </div>
            {phoneLabel?.notes && (
              <p className="text-[11px] text-slate-400 mt-1 truncate">{phoneLabel.notes}</p>
            )}
          </div>

          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Comunicaciones</span>
            <div className="mt-1 text-base font-bold text-white tabular-nums">
              {phoneRecords.length} eventos
            </div>
            <div className="text-[11px] text-slate-400">
              {outgoingCalls} salientes · {incomingCalls} entrantes
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Tiempo en Llamada</span>
            <div className="mt-1 text-base font-bold text-white tabular-nums">
              {Math.floor(totalSeconds / 60)} min {totalSeconds % 60} seg
            </div>
            <div className="text-[11px] text-slate-400">
              {smsCount} mensajes SMS detectados
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Aparatos IMEI</span>
            <div className="mt-1 text-sm font-bold text-white truncate tabular-nums">
              {associatedImeis[0] || 'No reportado'}
            </div>
            <div className="text-[11px] text-slate-400">
              {associatedImeis.length > 1 ? `Detectados ${associatedImeis.length} aparatos distintos` : 'Dispositivo único'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Contactos Frecuentes y Celdas de Mayor Presencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contactos Frecuentes */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-semibold text-white">Red de Interlocutores Directos</h2>
            <p className="text-xs text-slate-400">Números con mayor volumen de cruce e intercambio</p>
          </div>

          <div className="space-y-2.5">
            {interlocutors.map(([contactNum, data]) => {
              const label = labels.find(l => l.phoneNumber.replace(/\D/g, '') === contactNum.replace(/\D/g, ''));
              return (
                <div
                  key={contactNum}
                  onClick={() => setSelectedNumber(contactNum)}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: label?.color || '#64748B' }} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tabular-nums">{contactNum}</span>
                        {label && (
                          <span className="text-[10px] text-slate-300 font-medium">
                            · {label.label}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {label?.category ? `Cat: ${label.category.toUpperCase()}` : 'Sin etiqueta'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-slate-200 tabular-nums">{data.count} eventos</span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      {Math.round(data.duration / 60)} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Antenas Celulares Más Utilizadas en Juárez */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-semibold text-white">Celdas Celulares Frecuentes</h2>
            <p className="text-xs text-slate-400">Puntos de radiocomunicación en Ciudad Juárez</p>
          </div>

          <div className="space-y-3">
            {towerStats.map((t, idx) => (
              <div key={t.id} className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{idx + 1}.</span>
                    <span className="font-semibold text-white">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-blue-400 font-bold">{t.count} conexiones</span>
                    <span className="text-slate-400 text-[11px]">({t.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${t.percentage}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Operador: {t.operator}</span>
                  <span>Azimut de Cobertura: {t.azimuth}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial Cronológico de Movilidad y Llamadas */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Secuencia Cronológica de Conexiones</h2>
            <p className="text-xs text-slate-400">Movilidad paso a paso entre celdas de Ciudad Juárez</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {phoneRecords.length} registros cronológicos
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {phoneRecords.map((r, i) => {
            const isOutgoing = r.numberA === selectedNumber;
            const otherParty = isOutgoing ? r.numberB : r.numberA;
            const otherLabel = labels.find(l => l.phoneNumber.replace(/\D/g, '') === otherParty.replace(/\D/g, ''));

            return (
              <div 
                key={r.id} 
                className="p-2.5 rounded bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px] w-6 text-right">#{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{r.date} {r.time}</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-slate-300">
                        {isOutgoing ? '→ Llamó a' : '← Recibió de'} <strong className="text-blue-400">{otherParty}</strong>
                      </span>
                      {otherLabel && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          ({otherLabel.label})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{r.towerName}</span>
                      <span>·</span>
                      <span>Az: {r.azimuth}°</span>
                      {r.notes && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400 font-sans">{r.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-200">
                    {r.durationSeconds > 0 ? `${r.durationSeconds}s` : 'Sin duración'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
