import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlignLeft } from 'lucide-react';

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface Props {
  sector: any;
  onClose: () => void;
  onSave: (parameters: any) => Promise<void>;
}

export default function SectorFieldBuilder({ sector, onClose, onSave }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sector?.parameters?.fields) {
      setFields(sector.parameters.fields);
    }
  }, [sector]);

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), label: '', type: 'text', required: false }]);
  };

  const updateField = (id: string, key: keyof FieldDef, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parameters = { ...(sector.parameters || {}), fields };
      await onSave(parameters);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <AlignLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Form Builder: {sector.name}</h2>
              <p className="text-xs text-slate-400">Define what sellers fill out and customers see for this sector.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl border-dashed">
              <p className="text-slate-400 mb-4">No custom fields defined yet.</p>
              <button onClick={addField} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors rounded-lg font-bold text-sm flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" /> Add First Field
              </button>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4 bg-black/30 p-4 rounded-2xl border border-white/5 relative group">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Field Label (e.g. RAM, Size, Service Type)</label>
                    <input 
                      type="text" 
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                      placeholder="Enter field label"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Input Type</label>
                    <select 
                      value={field.type}
                      onChange={(e) => updateField(field.id, 'type', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-400 transition-colors appearance-none"
                    >
                      <option value="text">Text (String)</option>
                      <option value="number">Number</option>
                      <option value="boolean">Yes/No (Toggle)</option>
                      <option value="dropdown">Dropdown (Select)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    Required
                  </label>
                  <button onClick={() => removeField(field.id)} className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {fields.length > 0 && (
            <button onClick={addField} className="w-full py-4 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl text-slate-400 hover:text-indigo-400 font-bold transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Another Field
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Configuration</>}
          </button>
        </div>
      </div>
    </div>
  );
}
