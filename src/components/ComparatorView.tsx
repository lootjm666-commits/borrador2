import React, { useState, useMemo } from 'react';
import { CallDetailRecord, CellTower, PhoneLabel } from '../types/telecom';
import { GitCompare, MapPin, PhoneCall, Clock, Users, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface ComparatorViewProps {
  records: CallDetailRecord[];
  towers: CellTower[];
  labels: PhoneLabel[];
  onNavigateToMap: () => void;
}

export const ComparatorView: React.FC<ComparatorViewProps> = ({
  records,
  towers,
  labels,
  onNavigateToMap
}) => {
  const [phone1, setPhone1] = useState<string>('656-789-2041');
  const [phone2, setPhone2] = useState<string>('656-312-9988');
  const [timeWindowMinutes, setTimeWindowMinutes] = useState<number>(60);

  // Lista de números disponibles
  const availableNumbers = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      set.add(r.numberA);
      set.add(r.numberB);
    });
    return Array.from(set).sort();
  }, [records]);

  // Dimension 1: Llamadas directas entre Phone 1 y Phone 2
  const directCalls = useMemo(() => {
    const c1 = phone1.replace(/\D/g, '');
    const c2 = phone2.replace(/\D/g, '');
    return records.filter(r => {
      const a = r.numberA.replace(/\D/g, '');
      const b = r.numberB.replace(/\D/g, '');
      return (a === c1 && b === c2) || (a === c2 && b === c1);
    });
  }, [records, phone1, phone2]);

  // Dimension 2: Contactos en común
  const commonContacts = useMemo(() => {
    const c1 = phone1.replace(/\D/g, '');
    const c2 = phone2.replace(/\D/g, '');

    const contacts1 = new Set<string>();
    const contacts2 = new Set<string>();

    records.forEach(r => {
      const a = r.numberA.replace(/\D/g, '');
      const b = r.numberB.replace(/\D/g, '');

      if (a === c1 && b !== c2) contacts1.add(r.numberB);
      if (b === c1 && a !== c2) contacts1.add(r.numberA);

      if (a === c2 && b !== c1) contacts2.add(r.numberB);
      if (b === c2 && a !== c1) contacts2.add(r.numberA);
    });

    const common: string[] = [];
    contacts1.forEach(c => {
      if (contacts2.has(c)) common.push(c);
    });
    return common;
  }, [records, phone1, phone2]);

  // Dimension 3: Co-localización en antenas (misma torre dentro de ventana de tiempo)
  const coLocations = useMemo(() => {
    const c1 = phone1.replace(/\D/g, '');
    const c2 = phone2.replace(/\D/g, '');

    const r1 = records.filter(r => r.numberA.replace(/\D/g, '') === c1 || r.numberB.replace(/\D/g, '') === c1);
    const r2 = records.filter(r => r.numberA.replace(/\D/g, '') === c2 || r.numberB.replace(/\D/g, '') === c2);

    const matches: {
      towerName: string;
      date: string;
      time1: string;
      time2: string;
      diffMinutes: number;
      towerId: string;
    }[] = [];

    const windowMs = timeWindowMinutes * 60 * 1000;

    r1.forEach(rec1 => {
      r2.forEach(rec2 => {
        if (rec1.towerId === rec2.towerId) {
          const diff = Math.abs(rec1.timestamp - rec2.timestamp);
          if (diff <= windowMs) {
            matches.push({
              towerName: rec1.towerName,
              date: rec1.date,
              time1: rec1.time,
              time2: rec2.time,
              diffMinutes: Math.round(diff / 60000),
              towerId: rec1.towerId
            });
          }
        }
      });
    });

    return matches;
  }, [records, phone1, phone2, timeWindowMinutes]);

  const label1 = labels.find(l => l.phoneNumber.replace(/\D/g, '') === phone1.replace(/\D/g, ''));
  const label2 = labels.find(l => l.phoneNumber.replace(/\D/g, '') === phone2.replace(/\D/g, ''));

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <span>Cruce Telefónico y Co-localización Forense</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compara llamadas bilaterales directas, red de intermediarios comunes y concurrencia física en celdas de Ciudad Juárez
          </p>
        </div>
        <button
          onClick={onNavigateToMap}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Ver Rutas de Ambos en Mapa</span>
        </button>
      </div>

      {/* Selectores de Comparación */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Línea 1 */}
          <div className="md:col-span-5 p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Línea Telefónica A
            </span>
            <select
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white py-1.5 px-2 rounded font-mono font-bold"
            >
              {availableNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label1?.color || '#94A3B8' }} />
              <span className="text-slate-300 font-medium">{label1?.label || 'Sin etiqueta asignada'}</span>
            </div>
          </div>

          {/* Icono central de cruce */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-slate-400">
            <ArrowRightLeft className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-[10px] font-mono">VS</span>
          </div>

          {/* Línea 2 */}
          <div className="md:col-span-5 p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Línea Telefónica B
            </span>
            <select
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white py-1.5 px-2 rounded font-mono font-bold"
            >
              {availableNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label2?.color || '#94A3B8' }} />
              <span className="text-slate-300 font-medium">{label2?.label || 'Sin etiqueta asignada'}</span>
            </div>
          </div>
        </div>

        {/* Ventana de tiempo para co-localización */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tolerancia de Co-localización Espacio-Temporal:</span>
            <select
              value={timeWindowMinutes}
              onChange={(e) => setTimeWindowMinutes(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 py-1 px-2 rounded font-mono"
            >
              <option value={15}>± 15 minutos</option>
              <option value={30}>± 30 minutos</option>
              <option value={60}>± 60 minutos (Recomendado)</option>
              <option value={120}>± 2 horas</option>
            </select>
          </div>
          <span className="font-mono text-slate-400">Cruce automatizado en memoria forense</span>
        </div>
      </div>

      {/* Resultados del Cruce: 3 Dimensiones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Métrica 1: Llamadas Directas */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Comunicaciones Directas</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {directCalls.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Llamadas o mensajes bilaterales sin intermediarios
          </p>
        </div>

        {/* Métrica 2: Contactos en común */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Contactos Compartidos</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {commonContacts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Interlocutores mutuos vinculados a ambas líneas
          </p>
        </div>

        {/* Métrica 3: Co-localizaciones */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Co-localizaciones en Celdas</span>
            <MapPin className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {coLocations.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Presencia en la misma antena dentro de {timeWindowMinutes} min
          </p>
        </div>
      </div>

      {/* Detalle Tabular de Co-localizaciones (Evidencia Clave) */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Co-localización Espacio-Temporal en Ciudad Juárez</span>
            </h2>
            <p className="text-xs text-slate-400">
              Registros donde ambos objetivos engancharon la misma torre celular de forma simultánea o cercana
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {coLocations.length} coincidencias detectadas
          </span>
        </div>

        {coLocations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded border border-slate-800">
            No se encontraron eventos en la misma antena dentro de la ventana de {timeWindowMinutes} minutos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Antena en Juárez</th>
                  <th className="p-2.5">Fecha</th>
                  <th className="p-2.5">Hora Línea A</th>
                  <th className="p-2.5">Hora Línea B</th>
                  <th className="p-2.5 text-right">Diferencia</th>
                  <th className="p-2.5 text-right">Valor Probatorio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                {coLocations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-semibold text-white">{item.towerName}</td>
                    <td className="p-2.5 text-slate-300">{item.date}</td>
                    <td className="p-2.5 text-blue-400">{item.time1}</td>
                    <td className="p-2.5 text-amber-400">{item.time2}</td>
                    <td className="p-2.5 text-right font-bold text-rose-400 tabular-nums">
                      Δ {item.diffMinutes} min
                    </td>
                    <td className="p-2.5 text-right text-emerald-400 font-sans text-[11px]">
                      {item.diffMinutes <= 15 ? 'Alta Concurrencia (Crítica)' : 'Concurrencia Media'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle de Llamadas Directas */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Desglose de Comunicaciones Bilaterales</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {directCalls.length === 0 ? (
            <p className="text-xs text-slate-400">No existen llamadas directas registradas entre ambos números.</p>
          ) : (
            directCalls.map((c) => (
              <div key={c.id} className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-semibold text-white">{c.date} {c.time}</span>
                  <span className="text-slate-400 ml-2">({c.eventType})</span>
                  <span className="text-slate-300 block text-[11px] mt-0.5">
                    Antena: {c.towerName} · Azimut: {c.azimuth}°
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-200">{c.durationSeconds} seg</span>
                  {c.notes && <span className="block text-[10px] text-amber-400 font-sans">{c.notes}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
