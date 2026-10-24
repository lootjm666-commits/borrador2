import React, { useState, useEffect } from 'react';
import { LabelCategory, PhoneLabel } from '../types/telecom';
import { Tags } from 'lucide-react';

interface QuickLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  existingLabel?: PhoneLabel;
  caseId: string;
  onSave: (label: PhoneLabel) => void;
}

const CATEGORY_CHOICES: { id: LabelCategory; name: string; defaultColor: string }[] = [
  { id: 'sospechoso', name: 'Sospechoso / Blanco', defaultColor: '#EF4444' },
  { id: 'victima', name: 'Víctima Directa', defaultColor: '#3B82F6' },
  { id: 'papa', name: 'Papá / Padre', defaultColor: '#10B981' },
  { id: 'mama', name: 'Mamá / Madre', defaultColor: '#06B6D4' },
  { id: 'tia', name: 'Tía / Familiar', defaultColor: '#8B5CF6' },
  { id: 'dealer', name: 'Dealer / Proveedor', defaultColor: '#DC2626' },
  { id: 'didi', name: 'Didi / Chofer', defaultColor: '#F59E0B' },
  { id: 'tienda', name: 'Tienda / Saldo', defaultColor: '#64748B' },
  { id: 'otro', name: 'Otro', defaultColor: '#94A3B8' }
];

export const QuickLabelModal: React.FC<QuickLabelModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  existingLabel,
  caseId,
  onSave
}) => {
  const [labelName, setLabelName] = useState('');
  const [category, setCategory] = useState<LabelCategory>('sospechoso');
  const [color, setColor] = useState('#EF4444');
  const [notes, setNotes] = useState('');
  const [alias, setAlias] = useState('');

  useEffect(() => {
    if (existingLabel) {
      setLabelName(existingLabel.label);
      setCategory(existingLabel.category);
      setColor(existingLabel.color);
      setNotes(existingLabel.notes || '');
      setAlias(existingLabel.associatedSuspect || '');
    } else {
      setLabelName('');
      setCategory('sospechoso');
      setColor('#EF4444');
      setNotes('');
      setAlias('');
    }
  }, [existingLabel, phoneNumber]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelName.trim()) return;

    onSave({
      phoneNumber,
      label: labelName.trim(),
      category,
      color,
      notes: notes.trim(),
      associatedSuspect: alias.trim(),
      caseId,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedBy: 'Analista Forense UECS'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Etiquetar Línea Telefónica
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between">
          <span className="text-slate-400">Número a Clasificar:</span>
          <span className="text-white font-bold text-sm">{phoneNumber}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
              Etiqueta Descriptiva
            </label>
            <input
              type="text"
              required
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="ej. Papá, Sospechoso Negociador, Tía..."
              className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as LabelCategory;
                  setCategory(cat);
                  const opt = CATEGORY_CHOICES.find(o => o.id === cat);
                  if (opt) setColor(opt.defaultColor);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded font-mono"
              >
                {CATEGORY_CHOICES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-12 bg-transparent cursor-pointer rounded border border-slate-700"
                />
                <span className="font-mono text-slate-300">{color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
              Alias (Opcional)
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="ej. Alias 'El Cuervo'..."
              className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
              Notas de la Investigación
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas periciales o justificación de la clasificación..."
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
              Guardar Etiqueta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
