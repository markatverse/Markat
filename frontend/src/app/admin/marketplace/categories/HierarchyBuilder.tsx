import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Subcategory } from '@/context/ProductContext';
import { getSubcategoryEmoji } from '@/utils/categoryEmoji';

interface Props {
  subcategories: Subcategory[];
  onChange: (subcategories: Subcategory[]) => void;
}

export default function HierarchyBuilder({ subcategories, onChange }: Props) {
  const [expandedSubcat, setExpandedSubcat] = useState<number | null>(null);

  const addSubcategory = () => {
    onChange([...subcategories, { name: '', nestedSubcategories: [], parameters: [] }]);
  };

  const updateSubcategoryName = (index: number, name: string) => {
    const newSubcats = [...subcategories];
    newSubcats[index].name = name;
    onChange(newSubcats);
  };

  const removeSubcategory = (index: number) => {
    const newSubcats = [...subcategories];
    newSubcats.splice(index, 1);
    onChange(newSubcats);
  };

  const addSpecialization = (subcatIndex: number) => {
    const newSubcats = [...subcategories];
    if (!newSubcats[subcatIndex].nestedSubcategories) {
      newSubcats[subcatIndex].nestedSubcategories = [];
    }
    newSubcats[subcatIndex].nestedSubcategories!.push({ name: '', parameters: [] });
    onChange(newSubcats);
    setExpandedSubcat(subcatIndex);
  };

  const updateSpecializationName = (subcatIndex: number, specIndex: number, name: string) => {
    const newSubcats = [...subcategories];
    newSubcats[subcatIndex].nestedSubcategories![specIndex].name = name;
    onChange(newSubcats);
  };

  const removeSpecialization = (subcatIndex: number, specIndex: number) => {
    const newSubcats = [...subcategories];
    newSubcats[subcatIndex].nestedSubcategories!.splice(specIndex, 1);
    onChange(newSubcats);
  };

  return (
    <div className="space-y-3">
      {subcategories.map((subcat, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setExpandedSubcat(expandedSubcat === idx ? null : idx)} className="text-slate-400 hover:text-white">
              {expandedSubcat === idx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <span className="text-base shrink-0 w-6 flex items-center justify-center">
              {getSubcategoryEmoji(subcat.name)}
            </span>
            <input 
              type="text" 
              placeholder="Subcategory Name (e.g. Smartphones, Plumber)"
              value={subcat.name}
              onChange={e => updateSubcategoryName(idx, e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="button" onClick={() => addSpecialization(idx)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded">
              + Specialization
            </button>
            <button type="button" onClick={() => removeSubcategory(idx)} className="text-rose-400 hover:text-rose-300 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {expandedSubcat === idx && subcat.nestedSubcategories && subcat.nestedSubcategories.length > 0 && (
            <div className="mt-3 pl-6 space-y-2 border-l-2 border-slate-700 ml-2">
              {subcat.nestedSubcategories.map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <div className="w-4 border-t border-slate-700"></div>
                  <span className="text-sm shrink-0 w-5 flex items-center justify-center">
                    {getSubcategoryEmoji(spec.name, subcat.name)}
                  </span>
                  <input 
                    type="text" 
                    placeholder="Specialization (e.g. 5G Phones, Pipe Fitting)"
                    value={spec.name}
                    onChange={e => updateSpecializationName(idx, sIdx, e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button type="button" onClick={() => removeSpecialization(idx, sIdx)} className="text-rose-400 hover:text-rose-300 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addSubcategory} className="w-full py-2 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
        <Plus className="w-4 h-4" /> Add Subcategory
      </button>
    </div>
  );
}
