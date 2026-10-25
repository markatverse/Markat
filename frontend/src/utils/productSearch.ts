import type { Product } from '@/context/ProductContext';

const legacyServiceCategories = [
  'Services',
  'Home Services',
  'Transport',
  'Rentals',
  'Organizers',
  'Salon & Parlour',
  'Salon & Parlor',
  'Salon',
  'Beauty Parlour',
  'Spa',
  'Car Wash',
  'Automobile Service',
  'Doctor & Clinic',
  'Health & Wellness',
  'Event Services'
];

export function isServiceProduct(product?: Product | null) {
  if (!product) return false;
  if (product.primaryType === 'SERVICE') return true;
  if (product.primaryType === 'PRODUCT' || product.primaryType === 'VEHICLE') return false;
  const cat = (product.category || '').toLowerCase();
  const subcat = (product.subcategory || '').toLowerCase();
  if (
    cat.includes('salon') || cat.includes('saloon') || cat.includes('parlor') || cat.includes('parlour') ||
    cat.includes('spa') || cat.includes('beauty') || cat.includes('barber') ||
    cat.includes('service') || cat.includes('doctor') || cat.includes('clinic') ||
    cat.includes('car wash') || cat.includes('wash') ||
    cat.includes('professional') || cat.includes('legal') ||
    subcat.includes('salon') || subcat.includes('parlour') || subcat.includes('spa') ||
    subcat.includes('lawyer') || subcat.includes('advocate') || subcat.includes('legal') ||
    subcat.includes('consultant') || subcat.includes('accountant')
  ) {
    return true;
  }
  return legacyServiceCategories.some(c => c.toLowerCase() === cat);
}

export function matchesProductSearch(product: Product, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const searchableValues = [
    product.name,
    product.seller,
    product.brand,
    product.category,
    product.subcategory,
    product.nestedSubcategory,
    product.description,
    product.primaryType,
    ...Object.entries(product.parameters || {}).flatMap(([key, value]) => [
      key,
      ...(Array.isArray(value) ? value : [value]),
    ]),
  ];

  return searchableValues.some(value =>
    String(value || '').toLocaleLowerCase().includes(normalizedQuery),
  );
}
