"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, ChevronUp, ChevronDown, Layers, FileText, IndianRupee, Image, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { useProducts, FormField, useCategoryRules, BusinessModel } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';

interface DynamicFormEngineProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isService?: boolean;
  sellerSector?: string;
  activeVertical?: 'FOOD' | 'SALON' | 'DOCTOR' | 'NONE';
}

export default function DynamicFormEngine({ 
  initialData, 
  onSave, 
  onCancel, 
  isService = false,
  sellerSector: propSellerSector,
  activeVertical
}: DynamicFormEngineProps) {
  const { categories } = useProducts();
  const { user } = useAuth();
  
  // Basic Fields
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Hierarchy Fields
  const [primaryType, setPrimaryType] = useState<'PRODUCT'|'SERVICE'|'VEHICLE'>(initialData?.primaryType || (isService ? 'SERVICE' : 'PRODUCT'));

  useEffect(() => {
    if (!initialData?.primaryType) {
      setPrimaryType(isService ? 'SERVICE' : 'PRODUCT');
    }
  }, [isService, initialData]);

  const [category, setCategory] = useState(initialData?.category || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [nestedSubcategory, setNestedSubcategory] = useState(initialData?.nestedSubcategory || '');


  // Pricing
  const [sellingType, setSellingType] = useState<'B2C'|'B2B'>(initialData?.isB2B ? 'B2B' : 'B2C');
  const [costPrice, setCostPrice] = useState(initialData?.originalPrice?.toString() || '');
  const [discountPct, setDiscountPct] = useState(initialData?.discount?.replace('%', '') || '');
  const [b2cPrice, setB2cPrice] = useState(initialData?.price?.toString() || '');
  const [wholesaleTiers, setWholesaleTiers] = useState<{ minQty: number, price: number, discountPct?: string }[]>(initialData?.wholesaleTiers || [
    { minQty: 10, price: 0, discountPct: '' },
    { minQty: 50, price: 0, discountPct: '' },
    { minQty: 100, price: 0, discountPct: '' }
  ]);
  
  // Dynamic Attributes
  const [parameters, setParameters] = useState<Record<string, string | string[]>>(initialData?.parameters || {});
  
  // Custom Options (Variants/Services Menu)
  const [options, setOptions] = useState<{ id: string, name: string, price: number, discountPercentage?: number }[]>(initialData?.options || []);
  
  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialData?.images || (initialData?.image ? [initialData.image] : []));
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');

  // Location
  const [locState, setLocState] = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locArea, setLocArea] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pincode, setPincode] = useState(initialData?.pincode || '');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Watch Pincode for auto-fill
  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setIsVerifyingPin(true);
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setLocState(postOffice.State || '');
            setLocDistrict(postOffice.District || '');
            setLocCity(postOffice.Block || postOffice.Region || '');
          }
        })
        .catch(err => console.error("Pincode verification failed", err))
        .finally(() => setIsVerifyingPin(false));
    }
  }, [pincode]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
              headers: { 'User-Agent': 'MarkatVerse/1.0' }
            });
            const data = res.ok ? await res.json() : null;
            if (data && data.address) {
              setLocState(data.address.state || '');
              setLocDistrict(data.address.state_district || data.address.county || '');
              setLocCity(data.address.city || data.address.town || data.address.village || '');
              setPincode(data.address.postcode || '');
              
              const localFields = [
                data.address.road,
                data.address.neighbourhood,
                data.address.suburb
              ].filter(Boolean);
              if (localFields.length > 0) setLocArea(localFields.join(', '));
            }
          } catch (err) {
            console.error("Failed to get location details", err);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not get your location. Please check browser permissions.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Cascading Logic
  const catRules = useCategoryRules(category);
  const B2C_LIKE: BusinessModel[] = ['B2C', 'Appointment', 'Token', 'Meeting'];
  const B2B_LIKE: BusinessModel[] = ['B2B', 'Bulk Pricing', 'MOQ', 'RFQ', 'Quote', 'Sample'];
  const noModelRules = catRules.businessModels.length === 0;
  const canSellB2C = noModelRules || catRules.businessModels.some(m => B2C_LIKE.includes(m));
  const canSellB2B = !isService && (noModelRules || catRules.businessModels.some(m => B2B_LIKE.includes(m)));

  const primaryTypes = isService ? ['SERVICE'] : ['PRODUCT', 'VEHICLE'];
  
  const userSector = propSellerSector || user?.business?.sector || '';

  // Systematic Sector-to-Category Mapping
  const isCategoryAllowedForSeller = (catName: string): boolean => {
    const cName = catName.toLowerCase().trim();
    const sName = userSector.toLowerCase().trim();

    // 1. Check active vertical override if provided
    if (activeVertical === 'DOCTOR') {
      return ['healthcare', 'doctor', 'clinic', 'dentist', 'physiotherapy', 'medical'].includes(cName);
    }
    if (activeVertical === 'FOOD') {
      return ['food & dining', 'food & dining / restaurant', 'restaurant', 'cafe', 'food shop', 'dining', 'food'].includes(cName);
    }
    if (activeVertical === 'SALON') {
      return ['beauty', 'salon', 'spa', 'beauty parlour', 'salon & parlor', 'saloon'].includes(cName);
    }

    // 2. If no sector registered, allow all categories of primary type
    if (!sName) return true;

    // 3. Exact matching or sector-specific rules
    if (sName.includes('doctor') || sName.includes('health') || sName.includes('clinic')) {
      return ['healthcare', 'doctor', 'dentist', 'physiotherapy', 'medical'].includes(cName);
    }
    if (sName.includes('salon') || sName.includes('parlor') || sName.includes('beauty') || sName.includes('spa')) {
      return ['beauty', 'salon', 'spa', 'beauty parlour'].includes(cName);
    }
    if (sName.includes('food') || sName.includes('restaurant') || sName.includes('dining') || sName.includes('cafe')) {
      return ['food & dining', 'food & dining / restaurant', 'restaurant', 'cafe', 'food shop'].includes(cName);
    }
    if (sName.includes('home repair') || sName.includes('repair') || sName.includes('electrician') || sName.includes('plumb')) {
      return ['home', 'plumber', 'electrician', 'carpenter', 'mechanic', 'painter', 'cleaner'].includes(cName);
    }
    if (sName.includes('cleaning') || sName.includes('pest')) {
      return ['home', 'cleaner'].includes(cName);
    }
    if (sName.includes('professional')) {
      return ['professional', 'consultant', 'lawyer', 'accountant', 'freelancer', 'tutor'].includes(cName);
    }
    if (sName.includes('car wash') || sName.includes('automobile')) {
      return ['car wash', 'mechanic', 'sales & rentals'].includes(cName);
    }
    if (sName.includes('vehicle') || sName.includes('rental') || sName.includes('transport')) {
      return ['sales & rentals', 'car wash'].includes(cName);
    }
    if (sName.includes('electronic')) {
      return ['electronics'].includes(cName);
    }
    if (sName.includes('construction')) {
      return ['construction'].includes(cName);
    }
    if (sName.includes('agriculture') || sName.includes('farming')) {
      return ['agriculture'].includes(cName);
    }
    if (sName.includes('fashion') || sName.includes('apparel') || sName.includes('clothing')) {
      return ['fashion', 'apparel', 'clothing'].includes(cName);
    }
    if (sName.includes('grocery') || sName.includes('fmcg')) {
      return ['grocery & essentials', 'fmcg & groceries', 'grocery', 'food & dining'].includes(cName);
    }

    // Direct string match fallback
    return cName === sName || sName.includes(cName) || cName.includes(sName);
  };

  const availableCategories = categories.filter(c => {
    if (c.primaryType !== primaryType) return false;
    return isCategoryAllowedForSeller(c.name);
  });

  // Auto-select category based on user sector or registration restriction
  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      const directMatch = availableCategories.find(c => {
        const cLower = c.name.toLowerCase();
        const sLower = userSector.toLowerCase();
        return cLower === sLower || sLower.includes(cLower) || cLower.includes(sLower);
      });
      if (directMatch) {
        setCategory(directMatch.name);
      } else if (availableCategories.length === 1) {
        setCategory(availableCategories[0].name);
      }
    }
  }, [availableCategories, category, userSector]);

  const isCategoryLocked = availableCategories.length === 1 || (
    !!userSector && availableCategories.length > 0 && availableCategories.every(c => isCategoryAllowedForSeller(c.name)) && availableCategories.length === 1
  );

  const selectedCategory = availableCategories.find(c => c.name === category);
  const availableSubcategories = selectedCategory?.subcategories || [];
  const selectedSubcategory = availableSubcategories.find(s => s.name === subcategory);
  const availableNestedSubcategories = selectedSubcategory?.nestedSubcategories || [];
  const selectedNestedSubcategory = availableNestedSubcategories.find(n => n.name === nestedSubcategory);

  const activeParametersRaw = selectedNestedSubcategory?.parameters 
    || selectedSubcategory?.parameters 
    || selectedCategory?.parameters 
    || [];
  const activeParameters: FormField[] = Array.isArray(activeParametersRaw) ? activeParametersRaw : [];
  const hasPricelist = activeParameters.some(p => p.type === 'pricelist');

  useEffect(() => {
    if (availableSubcategories.length === 1 && !subcategory) {
      setSubcategory(availableSubcategories[0].name);
    }
  }, [availableSubcategories, subcategory]);

  useEffect(() => {
    if (availableNestedSubcategories.length === 1 && !nestedSubcategory) {
      setNestedSubcategory(availableNestedSubcategories[0].name);
    }
  }, [availableNestedSubcategories, nestedSubcategory]);

  // Reset downstream selections when a parent changes
  useEffect(() => {
    if (!availableCategories.find(c => c.name === category)) setCategory('');
  }, [primaryType]);

  useEffect(() => {
    if (!availableSubcategories.find(s => s.name === subcategory)) setSubcategory('');
  }, [category]);

  useEffect(() => {
    if (!availableNestedSubcategories.find(n => n.name === nestedSubcategory)) setNestedSubcategory('');
  }, [subcategory]);

  // Auto-adjust selling type when admin rules for the selected category dictate only one model
  useEffect(() => {
    if (catRules.businessModels.length === 0) return;
    const hasB2C = catRules.businessModels.some(m => (['B2C', 'Appointment', 'Token', 'Meeting'] as BusinessModel[]).includes(m));
    const hasB2B = catRules.businessModels.some(m => (['B2B', 'Bulk Pricing', 'MOQ', 'RFQ', 'Quote', 'Sample'] as BusinessModel[]).includes(m));
    if (!hasB2B && hasB2C) setSellingType('B2C');
    if (!hasB2C && hasB2B) setSellingType('B2B');
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploadingFiles(true);
    
    const files = Array.from(e.target.files);
    const base64Images: string[] = [];

    for (const file of files) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      base64Images.push(base64);
    }

    setUploadedImages(prev => [...prev, ...base64Images]);
    setIsUploadingFiles(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) { setImageUrlError('Please enter a URL.'); return; }
    try { new URL(trimmed); } catch { setImageUrlError('Please enter a valid URL (starting with http/https).'); return; }
    setUploadedImages(prev => [...prev, trimmed]);
    setImageUrlInput('');
    setImageUrlError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let finalPrice = 0;
    let finalOriginalPrice = undefined;
    let finalDiscount = undefined;

    if (sellingType === 'B2C') {
      finalPrice = Number(b2cPrice);
      if (costPrice) finalOriginalPrice = Number(costPrice);
      if (discountPct) finalDiscount = `${discountPct}%`;
    } else {
      finalPrice = wholesaleTiers[0].price;
    }

    const finalLocationString = [locArea, locCity, locDistrict, locState, pincode].filter(Boolean).join(', ');

    const payload = {
      name,
      description,
      primaryType,
      category,
      subcategory,
      nestedSubcategory,
      isB2B: sellingType === 'B2B',
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      discount: finalDiscount,
      quantity: 999, // default if not tracked
      wholesaleTiers: sellingType === 'B2B' ? wholesaleTiers : undefined,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      image: uploadedImages.length > 0 ? uploadedImages[0] : '/hero-left-logo.png',
      parameters,
      options: options.length > 0 ? options : undefined,
      location: finalLocationString,
      pincode,
      latitude,
      longitude
    };

    await onSave(payload);
    setIsSubmitting(false);
  };

  const handleCheckboxChange = (paramName: string, option: string, isChecked: boolean) => {
    setParameters(prev => {
      const current = (prev[paramName] as string[]) || [];
      if (isChecked) {
        return { ...prev, [paramName]: [...current, option] };
      } else {
        return { ...prev, [paramName]: current.filter(item => item !== option) };
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* 1. CLASSIFICATION BLOCK */}
      {(!isCategoryLocked || availableSubcategories.length > 1 || availableNestedSubcategories.length > 1) && (
        <div className="space-y-4 p-5 rounded-xl bg-slate-50/70 border border-slate-200/70">
          <div className="flex items-center gap-2.5 border-b border-slate-200/60 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Classification</h3>
              <p className="text-[11px] text-slate-500">Assign your listing to the matching sector and category hierarchy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableCategories.length > 0 && !isCategoryLocked && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Category</label>
                <select 
                  required
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm bg-white font-medium transition"
                >
                  <option value="">Select Category...</option>
                  {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}

            {availableCategories.length > 0 && isCategoryLocked && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Category</label>
                <div className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Locked to Sector</span>
                </div>
              </div>
            )}

          {availableSubcategories.length > 1 && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Subcategory</label>
              <select 
                value={subcategory} 
                onChange={e => setSubcategory(e.target.value)} 
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm bg-white font-medium transition"
              >
                <option value="">Select Subcategory...</option>
                {availableSubcategories.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}
          {availableSubcategories.length === 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subcategory</label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 text-sm font-semibold flex items-center justify-between shadow-inner">
                <span>{subcategory || availableSubcategories[0].name}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Assigned</span>
              </div>
            </div>
          )}

          {availableNestedSubcategories.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label>
              <select 
                value={nestedSubcategory} 
                onChange={e => setNestedSubcategory(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm bg-white font-medium shadow-sm transition"
              >
                <option value="">Select Type...</option>
                {availableNestedSubcategories.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
              </select>
            </div>
          )}
          {availableNestedSubcategories.length === 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 text-sm font-semibold flex items-center justify-between shadow-inner">
                <span>{nestedSubcategory || availableNestedSubcategories[0].name}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Standard</span>
              </div>
            </div>
          )}
        </div>

        {/* Workflow & Optional Features badge */}
        {catRules.workflow && (
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-200/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow:</span>
            <span className="text-xs font-semibold text-violet-800 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full shadow-sm">{catRules.workflow}</span>
            {catRules.optionalFeatures.length > 0 && (
              <>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Optional Features:</span>
                {catRules.optionalFeatures.map(f => (
                  <span key={f} className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold shadow-sm">{f}</span>
                ))}
              </>
            )}
          </div>
        )}

      </div>
      )}

      {/* 2. BASIC INFO */}
      <div className="space-y-4 p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
            2
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Basic Information</h3>
            <p className="text-[11px] text-slate-500">Provide clear and descriptive information for customers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{isService ? 'Service Title *' : 'Listing Title *'}</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder={isService ? "e.g. AC Repair & Servicing" : "e.g. Samsung Galaxy S23 Ultra"} 
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none text-slate-900 text-sm font-medium transition" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder={isService ? "Describe your service, what's included, etc." : "Detailed description..."} 
              rows={1} 
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none text-slate-900 text-sm font-medium transition resize-none" 
            />
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC ATTRIBUTES */}
      {activeParameters.length > 0 && (
        <div className="space-y-4 p-5 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-center gap-2.5 border-b border-slate-200/60 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications & Attributes</h3>
              <p className="text-[11px] text-slate-500">Configure sector-specific parameters for this listing.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-slate-200">
            {activeParameters.map(param => (
              <div key={param.name} className={`space-y-3 ${param.type === 'pricelist' ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}>
                <label className="text-sm font-semibold text-slate-700">{param.name}</label>
                
                {param.type === 'text' && (
                  <input type="text" value={(parameters[param.name] as string) || ''} onChange={e => setParameters({...parameters, [param.name]: e.target.value})} placeholder={param.placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm" />
                )}

                {param.type === 'number' && (
                  <input type="number" value={(parameters[param.name] as string) || ''} onChange={e => setParameters({...parameters, [param.name]: e.target.value})} placeholder={param.placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm" />
                )}

                {param.type === 'radio' && param.options && (
                  <div className="flex flex-col gap-2">
                    {param.options.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input type="radio" name={param.name} value={opt} checked={parameters[param.name] === opt} onChange={e => setParameters({...parameters, [param.name]: e.target.value})} className="w-4 h-4 text-blue-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {param.type === 'checkbox' && param.options && (
                  <div className="flex flex-col gap-2">
                    {param.options.map(opt => {
                      const isChecked = ((parameters[param.name] as string[]) || []).includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                          <input type="checkbox" checked={isChecked} onChange={e => handleCheckboxChange(param.name, opt, e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}

                {param.type === 'pricelist' && (
                  <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-1">
                    <p className="text-xs text-slate-500 font-medium">Select the options you offer and set your pricing.</p>
                    <div className="space-y-3">
                      {Array.from(new Set([...(param.options || []), ...options.map(o => o.name)])).map(optName => {
                        const existingOption = options.find(o => o.name === optName);
                        const isChecked = !!existingOption;
                        return (
                          <div key={optName} className={`flex flex-wrap items-center gap-4 p-3 rounded-xl border transition-colors ${isChecked ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                            <label className="flex items-center gap-3 cursor-pointer min-w-[150px] flex-1">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setOptions([...options, { id: Math.random().toString(36).substr(2, 9), name: optName, price: 0 }]);
                                  } else {
                                    setOptions(options.filter(o => o.name !== optName));
                                  }
                                }}
                                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                              />
                              <span className={`font-semibold ${isChecked ? 'text-blue-800' : 'text-slate-600'}`}>{optName}</span>
                            </label>
                            {isChecked && (
                              <div className="flex gap-3 flex-wrap items-center">
                                <div className="w-32">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Price</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                    <input type="number" min="0" value={existingOption.price || ''} onChange={e => setOptions(options.map(o => o.name === optName ? { ...o, price: Math.max(0, Number(e.target.value)) } : o))} className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 outline-none text-sm bg-white focus:border-blue-500" />
                                  </div>
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Discount</label>
                                  <div className="relative">
                                    <input type="number" min="0" max="100" value={existingOption.discountPercentage || ''} onChange={e => setOptions(options.map(o => o.name === optName ? { ...o, discountPercentage: Math.min(100, Math.max(0, Number(e.target.value))) } : o))} placeholder="0" className="w-full pl-3 pr-7 py-1.5 rounded-lg border border-slate-300 outline-none text-sm bg-white focus:border-blue-500" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                                  </div>
                                </div>
                                {!(param.options || []).includes(optName) && (
                                  <button type="button" onClick={() => setOptions(options.filter(o => o.name !== optName))} className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => {
                        const customName = prompt('Enter custom option name:');
                        if (customName && customName.trim()) {
                          if (!options.find(o => o.name.toLowerCase() === customName.trim().toLowerCase()) && !(param.options || []).some(o => o.toLowerCase() === customName.trim().toLowerCase())) {
                            setOptions([...options, { id: Math.random().toString(36).substr(2, 9), name: customName.trim(), price: 0 }]);
                          }
                        }
                      }} className="mt-2 w-full p-3 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">
                      <PlusCircle className="w-4 h-4" /> Add Custom {param.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCTOR SPECIFIC FIELDS */}
      {(category === 'Doctor' || category === 'Healthcare' || category.includes('Doctor')) ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-2 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">Medical Workflow</span>
            Professional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Medical Registration No (MCI/SMC) *</label>
              <input required type="text" value={parameters['MCI Number'] as string || ''} onChange={e => setParameters(p => ({...p, 'MCI Number': e.target.value}))} placeholder="e.g. MCI-12345" className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Specialization *</label>
              <select required value={parameters['Specialization'] as string || ''} onChange={e => setParameters(p => ({...p, 'Specialization': e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none text-slate-900 bg-white">
                <option value="">Select Specialization...</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Dentist">Dentist</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Years of Experience *</label>
              <input required type="number" min="0" value={parameters['Experience'] as string || ''} onChange={e => setParameters(p => ({...p, 'Experience': e.target.value}))} placeholder="e.g. 5" className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none text-slate-900" />
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. PRICING & SELLING TYPE */}
      <div className="space-y-4 p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-100">
            {activeParameters.length > 0 ? '4' : '3'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pricing & Sales Model</h3>
            <p className="text-[11px] text-slate-500">Configure retail, wholesale pricing, or booking service models.</p>
          </div>
        </div>
        
        {(canSellB2C && canSellB2B) && (
          <div className="flex gap-3 mb-2">
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${sellingType === 'B2C' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500'}`}>
              <input type="radio" name="sellingType" value="B2C" checked={sellingType === 'B2C'} onChange={() => setSellingType('B2C')} className="hidden" />
              <div className="text-center">
                <div className="font-bold text-sm">B2C / Retail</div>
                <div className="text-[10px] opacity-80">Fixed Price per Unit</div>
              </div>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${sellingType === 'B2B' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}>
              <input type="radio" name="sellingType" value="B2B" checked={sellingType === 'B2B'} onChange={() => setSellingType('B2B')} className="hidden" />
              <div className="text-center">
                <div className="font-bold text-sm">B2B / Wholesale</div>
                <div className="text-[10px] opacity-80">Tiered Bulk Pricing</div>
              </div>
            </label>
          </div>
        )}
        {/* Admin-allowed business models info row */}
        {catRules.businessModels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Admin-approved:</span>
            {catRules.businessModels.map(bm => {
              let colors = "bg-slate-100 text-slate-700 border-slate-200";
              if (bm === 'B2C') colors = "bg-emerald-50 text-emerald-700 border-emerald-200";
              if (bm === 'B2B') colors = "bg-blue-50 text-blue-700 border-blue-200";
              if (bm === 'Appointment') colors = "bg-amber-50 text-amber-700 border-amber-200";
              if (bm === 'Token') colors = "bg-violet-50 text-violet-700 border-violet-200";
              
              return (
                <span key={bm} className={`text-[11px] border px-2 py-0.5 rounded-full font-semibold ${colors}`}>{bm}</span>
              );
            })}
          </div>
        )}

        {sellingType === 'B2C' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {!isService && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Cost Price / MRP (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input type="number" min="0" value={costPrice} onChange={e => {
                    const val = e.target.value; 
                    setCostPrice(val === '' ? '' : Math.max(0, Number(val)).toString());
                    if (val && b2cPrice) {
                      const cost = Number(val);
                      const sell = Number(b2cPrice);
                      if (cost > 0 && cost >= sell) {
                        setDiscountPct(((cost - sell) / cost * 100).toFixed(0));
                      }
                    }
                  }} placeholder="0.00" className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-slate-900 text-sm font-medium" />
                </div>
              </div>
            )}
            {!(isService && options.length > 0) && (
              <div className={`space-y-1 ${isService ? 'md:col-span-3 lg:col-span-1' : ''}`}>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{isService ? 'Service Charge / Price (₹)' : 'Final Selling Price (₹)'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input required={options.length === 0} type="number" min="0" value={b2cPrice} onChange={e => {
                    const val = e.target.value; 
                    setB2cPrice(val === '' ? '' : Math.max(0, Number(val)).toString());
                    if (!isService && val && costPrice) {
                      const cost = Number(costPrice);
                      const sell = Number(val);
                      if (cost > 0 && cost >= sell) {
                        setDiscountPct(((cost - sell) / cost * 100).toFixed(0));
                      }
                    }
                  }} placeholder="0.00" className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-slate-900 text-sm font-medium" />
                </div>
              </div>
            )}

            {!isService && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Discount (%)</label>
                <div className="relative">
                  <input type="number" min="0" max="100" value={discountPct} onChange={e => {
                    const val = e.target.value; 
                    const numVal = Math.min(100, Math.max(0, Number(val)));
                    setDiscountPct(val === '' ? '' : numVal.toString());
                    if (val && costPrice) {
                      const cost = Number(costPrice);
                      setB2cPrice((cost - (cost * numVal / 100)).toFixed(2));
                    }
                  }} placeholder="0" className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-slate-900 text-sm font-medium" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
            )}
            
            {isService && (
              <div className="col-span-1 md:col-span-3 mt-2 space-y-2 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Service Booking Model</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${(parameters['bookingModel'] as string) === 'TOKEN' || !parameters['bookingModel'] ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500 hover:border-violet-200'}`}>
                    <input type="radio" name="bookingModel" value="TOKEN" checked={(parameters['bookingModel'] as string) === 'TOKEN' || !parameters['bookingModel']} onChange={() => setParameters(p => ({...p, bookingModel: 'TOKEN'}))} className="hidden" />
                    <div className="text-center">
                      <div className="font-bold text-xs">Live Token</div>
                      <div className="text-[10px] opacity-80">Walk-ins only</div>
                    </div>
                  </label>
                  
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${(parameters['bookingModel'] as string) === 'APPOINTMENT' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200'}`}>
                    <input type="radio" name="bookingModel" value="APPOINTMENT" checked={(parameters['bookingModel'] as string) === 'APPOINTMENT'} onChange={() => setParameters(p => ({...p, bookingModel: 'APPOINTMENT'}))} className="hidden" />
                    <div className="text-center">
                      <div className="font-bold text-xs">Appointment</div>
                      <div className="text-[10px] opacity-80">Fixed time slots</div>
                    </div>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${(parameters['bookingModel'] as string) === 'HYBRID' ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-slate-200 bg-white text-slate-500 hover:border-fuchsia-200'}`}>
                    <input type="radio" name="bookingModel" value="HYBRID" checked={(parameters['bookingModel'] as string) === 'HYBRID'} onChange={() => setParameters(p => ({...p, bookingModel: 'HYBRID'}))} className="hidden" />
                    <div className="text-center">
                      <div className="font-bold text-xs">Hybrid (Both)</div>
                      <div className="text-[10px] opacity-80">Walk-ins + Appointments</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-w-xs space-y-2 mb-6">
              <label className="text-sm font-semibold text-slate-700">Base Cost Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input type="number" min="0" value={costPrice} onChange={e => {
                  const val = e.target.value; 
                  setCostPrice(val === '' ? '' : Math.max(0, Number(val)).toString());
                }} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium" />
              </div>
              <p className="text-[10px] text-slate-500">Optional: Track your own cost price for profit calculation.</p>
            </div>
              <label className="text-sm font-semibold text-slate-700">Wholesale Pricing Tiers</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wholesaleTiers.map((tier, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier {index + 1}</span>
                      {index > 0 && (
                        <button type="button" onClick={() => setWholesaleTiers(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Min Quantity (+)</label>
                      <input type="number" min="0" value={tier.minQty} onChange={e => {
                        const newTiers = [...wholesaleTiers];
                        newTiers[index].minQty = Math.max(0, Number(e.target.value));
                        setWholesaleTiers(newTiers);
                      }} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">Discount (%)</label>
                        <div className="relative mt-1">
                          <input type="number" min="0" max="100" value={tier.discountPct || ''} onChange={e => {
                            const val = e.target.value;
                            const numVal = Math.min(100, Math.max(0, Number(val)));
                            const newTiers = [...wholesaleTiers];
                            newTiers[index].discountPct = val === '' ? '' : numVal.toString();
                            if (val && costPrice) {
                              const cost = Number(costPrice);
                              newTiers[index].price = Number((cost - (cost * numVal / 100)).toFixed(2));
                            }
                            setWholesaleTiers(newTiers);
                          }} className="w-full pl-2 pr-6 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Unit Price (₹)</label>
                        <input type="number" min="0" value={tier.price} onChange={e => {
                          const val = e.target.value;
                          const newTiers = [...wholesaleTiers];
                          newTiers[index].price = Math.max(0, Number(val));
                          if (val && costPrice) {
                            const cost = Number(costPrice);
                            const sell = Number(val);
                            if (cost > 0 && cost >= sell) {
                              newTiers[index].discountPct = ((cost - sell) / cost * 100).toFixed(0);
                            }
                          }
                          setWholesaleTiers(newTiers);
                        }} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm mt-1" />
                      </div>
                    </div>
                    {(tier.minQty > 0 && tier.price > 0) && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700">
                          Total Bulk Price: <span className="text-blue-600">₹{tier.minQty * tier.price}</span> for {tier.minQty} units
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setWholesaleTiers(prev => [...prev, { minQty: 0, price: 0, discountPct: '' }])} className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-colors">
                  <PlusCircle className="w-6 h-6" />
                  <span className="text-sm font-semibold">Add Tier</span>
                </button>
              </div>
          </div>
        )}

        {/* Dynamic Options (Variants/Services) */}
        {!hasPricelist && (canSellB2C || isService) && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">Custom Options & Variants</h4>
            <p className="text-xs text-slate-500">Add variations like specific services (e.g. Haircut, Massage) or product variants (e.g. Size, Material) with custom pricing.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {options.map((opt, index) => (
                <div key={opt.id} className="flex gap-3 items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <button type="button" disabled={index === 0} onClick={() => {
                      const newOpts = [...options];
                      const temp = newOpts[index - 1];
                      newOpts[index - 1] = newOpts[index];
                      newOpts[index] = temp;
                      setOptions(newOpts);
                    }} className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5 rounded transition">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" disabled={index === options.length - 1} onClick={() => {
                      const newOpts = [...options];
                      const temp = newOpts[index + 1];
                      newOpts[index + 1] = newOpts[index];
                      newOpts[index] = temp;
                      setOptions(newOpts);
                    }} className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 p-0.5 rounded transition">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <input type="text" value={opt.name} onChange={e => {
                      const newOpts = [...options];
                      newOpts[index].name = e.target.value;
                      setOptions(newOpts);
                    }} placeholder="Option Name (e.g. Haircut, Size L)" className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input type="number" value={opt.price} onChange={e => {
                        const newOpts = [...options];
                        newOpts[index].price = Number(e.target.value);
                        setOptions(newOpts);
                      }} placeholder="0" className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 outline-none text-sm" />
                    </div>
                  </div>
                  <button type="button" onClick={() => setOptions(options.filter((_, i) => i !== index))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setOptions([...options, { id: Math.random().toString(36).substr(2, 9), name: '', price: 0 }])} className="w-full p-3 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">
                <PlusCircle className="w-4 h-4" /> Add Option / Variant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MEDIA UPLOAD */}
      <div className="space-y-4 p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2.5 border-b border-slate-200/60 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs border border-violet-100">
            {activeParameters.length > 0 ? '5' : '4'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Media & Images</h3>
            <p className="text-[11px] text-slate-500">Upload high-resolution photos or provide external image URLs.</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setImageInputMode('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              imageInputMode === 'upload'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            📁 Upload File
          </button>
          <button
            type="button"
            onClick={() => { setImageInputMode('url'); setImageUrlError(''); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              imageInputMode === 'url'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            🔗 Add URL
          </button>
        </div>

        {/* URL input row */}
        {imageInputMode === 'url' && (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={e => { setImageUrlInput(e.target.value); setImageUrlError(''); }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              >
                Add Image
              </button>
            </div>
            {imageUrlError && <p className="text-red-500 text-xs font-medium">{imageUrlError}</p>}
          </div>
        )}

        {/* Thumbnail grid */}
        <div className="flex flex-wrap gap-3">
          {uploadedImages.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group shadow-sm">
              <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => removeImage(i)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 shadow-md">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {imageInputMode === 'upload' && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600 group">
              {isUploadingFiles ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              <span className="text-[10px] font-bold">{isUploadingFiles ? 'Uploading...' : 'Add Images'}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploadingFiles} />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-5 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-all text-xs"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isSubmitting ? 'Saving Listing...' : 'Publish Listing'}
        </button>
      </div>
    </form>
  );
}
