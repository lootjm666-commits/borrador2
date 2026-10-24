import React, { useState } from 'react';
import { InvestigationCase } from '../types/telecom';
import { FolderLock } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: InvestigationCase) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase
}) => {
  const [caseNumber, setCaseNumber] = useState('EXP-CJ-2024-');
  const [title, setTitle] = useState('');
  const [crimeType, setCrimeType] = useState<InvestigationCase['crimeType']>('Secuestro Agravado');
  const [primaryTarget, setPrimaryTarget] = useState('656-');
  const [leadInvestigator, setLeadInvestigator] = useState('Analista Forense UECS Juárez');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber || !title || !primaryTarget) return;

    const newCase: InvestigationCase = {
      id: `CASE-${Date.now()}`,
      caseNumber: caseNumber.trim(),
      title: title.trim(),
      crimeType,
      status: 'ACTIVO',
      leadInvestigator: leadInvestigator.trim(),
      unit: 'Unidad Especializada en Combate al Secuestro (UECS Cd. Juárez)',
      primaryTargetNumber: primaryTarget.trim(),
      secondaryNumbers: [],
      totalRecordsCount: 0,
      creationDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      summary: summary.trim() || 'Carpeta ministerial abierta para análisis de sábanas telefónicas.'
    };

    onSaveCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Abrir Nueva Carpeta de Investigación UECS
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Número de Carpeta
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="EXP-CJ-2024-XXXX"
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Tipo de Delito
              </label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
              >
                <option value="Secuestro Agravado">Secuestro Agravado</option>
                <option value="Secuestro Express">Secuestro Express</option>
                <option value="Extorsión Telefónica">Extorsión Telefónica</option>
                <option value="Privación Ilegal de la Libertad">Privación Ilegal de la Libertad</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
              Título de la Causa o Asunto
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Secuestro Express Zona Pronaf..."
              className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Número Objetivo Principal
              </label>
              <input
                type="text"
                required
                value={primaryTarget}
                onChange={(e) => setPrimaryTarget(e.target.value)}
                placeholder="656-XXX-XXXX"
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Perito / Analista Responsable
              </label>
              <input
                type="text"
                required
                value={leadInvestigator}
                onChange={(e) => setLeadInvestigator(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
              Resumen Inicial de Hechos
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Descripción de la denuncia ministerial, modus operandi inicial o requerimiento judicial..."
              className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded"
            >
              Crear Carpeta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
