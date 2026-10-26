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

const physicalProductCategories = [
  'electronics',
  'fashion',
  'home & kitchen',
  'home & living',
  'construction',
  'construction materials',
  'industrial machinery & tools',
  'industrial',
  'grocery & fmcg',
  'grocery',
  'healthcare & medical devices',
  'automotive parts & accessories',
  'beauty, cosmetics & personal care',
  'sports, fitness & outdoor',
  'books, stationery & office supplies',
  'kids, toys & baby care',
  'jewelry, watches & luxury',
  'pet supplies & pet care',
  'mobile',
  'laptop',
  'cement',
  'power tools'
];

export function isServiceProduct(product?: (Product & { type?: string }) | null): boolean {
  if (!product) return false;
  
  // 1. Explicit primaryType or database type flag
  const pType = (((product as any).primaryType || (product as any).type || '') + '').toUpperCase();
  if (pType === 'PRODUCT' || pType === 'VEHICLE') return false;
  if (pType === 'SERVICE') return true;

  const cat = (product.category || '').toLowerCase().trim();
  const subcat = (product.subcategory || '').toLowerCase().trim();

  // 2. Physical product categories are NEVER services
  if (physicalProductCategories.some(c => cat === c || cat.startsWith(c) || subcat === c)) {
    return false;
  }

  // 3. Explicit service categories
  if (legacyServiceCategories.some(c => c.toLowerCase() === cat || cat.startsWith(c.toLowerCase()))) {
    return true;
  }

  // 4. Specific service subcategories and keywords
  if (
    cat === 'salon' || cat === 'spa' || cat === 'car wash' || cat === 'services' ||
    cat === 'home services' || cat === 'event services' || cat === 'freelancer' ||
    subcat.includes('salon service') || subcat.includes('spa service') ||
    subcat.includes('haircut') || subcat.includes('facial & clean-up') ||
    subcat.includes('car wash service') || subcat.includes('detailing package') ||
    subcat.includes('repair service') || subcat.includes('consultation') ||
    subcat.includes('lawyer') || subcat.includes('advocate') || subcat.includes('legal counsel') ||
    subcat.includes('chartered accountant') || subcat.includes('tax consultant')
  ) {
    return true;
  }

  return false;
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
