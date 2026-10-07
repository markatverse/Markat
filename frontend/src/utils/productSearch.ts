import type { Product } from '@/context/ProductContext';

const legacyServiceCategories = ['Services', 'Home Services', 'Transport', 'Rentals', 'Organizers'];

export function isServiceProduct(product: Product) {
  return product.primaryType
    ? product.primaryType === 'SERVICE'
    : legacyServiceCategories.includes(product.category);
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
