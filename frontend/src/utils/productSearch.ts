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
  'Event Services',
  'Food & Dining',
  'Restaurants',
  'Restaurant',
  'Dining',
  'Food & Beverages',
  'Cafes',
  'Cafe',
  'Bistro',
  'Catering',
  'Hotel & Hospitality',
  'Professional Services',
  'Legal Services',
  'Consulting'
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

export const BRAND_SYNONYMS = [
  'markatverse',
  'maratverse',
  'marketverse',
  'markat verse',
  'market verse',
  'marat verse',
  'marcatverse',
  'markatvers',
  'markat',
  'mkv',
];

/**
 * Fast Levenshtein distance calculation for typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks for phonetic or typo match (e.g., 'lapotp' -> 'laptop', 'maratverse' -> 'markatverse')
 */
export function isFuzzyMatch(target: string, query: string): boolean {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q) || q.includes(t)) return true;

  const words = t.split(/[\s,.-]+/);
  for (const w of words) {
    if (w.length >= 4 && q.length >= 4) {
      const maxDistance = q.length > 6 ? 2 : 1;
      if (levenshteinDistance(w, q) <= maxDistance) {
        return true;
      }
    }
  }
  return false;
}

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
    cat.includes('food & dining') || cat.includes('restaurant') || cat.includes('dining') ||
    subcat.includes('restaurant') || subcat.includes('dining') || subcat.includes('bistro') ||
    subcat.includes('cafe') || subcat.includes('salon service') || subcat.includes('spa service') ||
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

  // 1. Brand / Platform search matching (maratverse, marketverse, markat verse, etc.)
  if (BRAND_SYNONYMS.includes(normalizedQuery)) {
    return true;
  }

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

  // 2. Exact or Substring match
  const hasSubstringMatch = searchableValues.some(value =>
    String(value || '').toLocaleLowerCase().includes(normalizedQuery),
  );
  if (hasSubstringMatch) return true;

  // 3. Typo-tolerant Fuzzy Match
  return searchableValues.some(value =>
    isFuzzyMatch(String(value || ''), normalizedQuery)
  );
}
