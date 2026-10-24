import React, { useState } from 'react';
import { LabelCategory, PhoneLabel } from '../types/telecom';
import { Tags, Plus, Search, Trash2, Edit2, ShieldAlert, Phone, UserCheck, AlertCircle } from 'lucide-react';

interface LabelsManagementViewProps {
  labels: PhoneLabel[];
  onSaveLabel: (label: PhoneLabel) => void;
  onDeleteLabel: (phoneNumber: string) => void;
}

const CATEGORY_OPTIONS: { id: LabelCategory; name: string; defaultColor: string }[] = [
  { id: 'sospechoso', name: 'Sospechoso / Blanco', defaultColor: '#EF4444' },
  { id: 'victima', name: 'Víctima Directa', defaultColor: '#3B82F6' },
  { id: 'papa', name: 'Papá / Padre de Familia', defaultColor: '#10B981' },
  { id: 'mama', name: 'Mamá / Madre de Familia', defaultColor: '#06B6D4' },
  { id: 'tia', name: 'Tía / Tío Familiar', defaultColor: '#8B5CF6' },
  { id: 'hermano', name: 'Hermano / Pariente', defaultColor: '#6366F1' },
  { id: 'dealer', name: 'Dealer / Proveedor', defaultColor: '#DC2626' },
  { id: 'didi', name: 'Didi / Chofer / Uber', defaultColor: '#F59E0B' },
  { id: 'tienda', name: 'Tienda / Punto Fijo', defaultColor: '#64748B' },
  { id: 'cobrador', name: 'Cobrador / Intermediario', defaultColor: '#D97706' },
  { id: 'contacto_frecuente', name: 'Contacto Frecuente', defaultColor: '#475569' },
  { id: 'otro', name: 'Otro / En Análisis', defaultColor: '#94A3B8' }
];

export const LabelsManagementView: React.FC<LabelsManagementViewProps> = ({
  labels,
  onSaveLabel,
  onDeleteLabel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<PhoneLabel | null>(null);

  // Campos de formulario
  const [phoneInput, setPhoneInput] = useState('');
  const [labelNameInput, setLabelNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<LabelCategory>('sospechoso');
  const [colorInput, setColorInput] = useState('#EF4444');
  const [notesInput, setNotesInput] = useState('');
  const [aliasInput, setAliasInput] = useState('');

  const filteredLabels = labels.filter(l => {
    const matchesSearch = 
      l.phoneNumber.includes(searchTerm) ||
      l.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.associatedSuspect?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingLabel(null);
    setPhoneInput('');
    setLabelNameInput('');
    setCategoryInput('sospechoso');
    setColorInput('#EF4444');
    setNotesInput('');
    setAliasInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (label: PhoneLabel) => {
    setEditingLabel(label);
    setPhoneInput(label.phoneNumber);
    setLabelNameInput(label.label);
    setCategoryInput(label.category);
    setColorInput(label.color);
    setNotesInput(label.notes || '');
    setAliasInput(label.associatedSuspect || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !labelNameInput) return;

    const newLabel: PhoneLabel = {
      phoneNumber: phoneInput.trim(),
      label: labelNameInput.trim(),
      category: categoryInput,
      color: colorInput,
      notes: notesInput.trim(),
      associatedSuspect: aliasInput.trim(),
      caseId: editingLabel?.caseId || 'CASE-2024-0891',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedBy: 'Analista Forense UECS'
    };

    onSaveLabel(newLabel);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Tags className="w-5 h-5 text-blue-400" />
            <span>Directorio de Etiquetado Manual de Números</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Clasificación forense de números telefónicos frecuentes (papá, mamá, tía, sospechoso, dealer, didi, etc.)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Etiquetar Nuevo Número</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-3 rounded">
        <div className="md:col-span-8 flex items-center gap-2 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número telefónico (ej. 656-789-2041), etiqueta, alias o notas..."
            className="bg-transparent border-none text-white placeholder-slate-400 w-full focus:outline-none font-mono"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">✕</button>
          )}
        </div>

        <div className="md:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 text-xs text-slate-200 py-2 px-2.5 rounded font-mono"
          >
            <option value="ALL">Todas las Categorías ({labels.length})</option>
            {CATEGORY_OPTIONS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de Etiquetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabels.map((l) => (
          <div
            key={l.phoneNumber}
            className="p-4 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {l.phoneNumber}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {l.category}
                </span>
              </div>

              <h2 className="text-xs font-semibold text-slate-200 mb-1">{l.label}</h2>
              {l.associatedSuspect && (
                <div className="text-[11px] text-rose-400 font-mono mb-2">
                  Alias: <strong>{l.associatedSuspect}</strong>
                </div>
              )}
              {l.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed font-sans">
                  {l.notes}
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">Act: {l.updatedAt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(l)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteLabel(l.phoneNumber)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Tags className="w-4 h-4 text-blue-400" />
                <span>{editingLabel ? 'Editar Etiqueta' : 'Asignar Etiqueta Manual'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Número Telefónico (10 Dígitos)
                </label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="ej. 656-789-2041"
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Etiqueta / Nombre Descriptivo
                </label>
                <input
                  type="text"
                  required
                  value={labelNameInput}
                  onChange={(e) => setLabelNameInput(e.target.value)}
                  placeholder="ej. Papá de la víctima, Sospechoso 1, Conductor Didi..."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Categoría Táctica
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => {
                      const cat = e.target.value as LabelCategory;
                      setCategoryInput(cat);
                      const opt = CATEGORY_OPTIONS.find(o => o.id === cat);
                      if (opt) setColorInput(opt.defaultColor);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded font-mono"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Color de Alerta
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="h-8 w-12 bg-transparent cursor-pointer rounded border border-slate-700"
                    />
                    <span className="font-mono text-slate-300">{colorInput}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Alias o Sujeto Vinculado (Opcional)
                </label>
                <input
                  type="text"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="ej. Alias 'El Cuervo', Célula Poniente..."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Notas del Analista Ministerial
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Detalles probatorios, relación con los hechos o justificación de la etiqueta..."
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors shadow-sm"
                >
                  Guardar Etiqueta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
