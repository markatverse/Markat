"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: string;
  reviews: string;
  seller: string;
  sellerId?: string;
  location: string;
  primaryType?: 'PRODUCT' | 'SERVICE' | 'VEHICLE';
  category: string;
  subcategory?: string;
  nestedSubcategory?: string;
  description?: string;
  image?: string;
  images?: string[];
  badge?: string;
  badgeColor?: string;
  isPremium?: boolean;
  isB2B?: boolean;
  moq?: number;
  wholesaleTiers?: { minQty: number, margin: number }[];
  brand?: string;
  status?: string;
  parameters?: Record<string, string | string[]>;
  options?: { id: string; name: string; price: number; discountPercentage?: number }[];
  _distance?: number;
  _outOfRange?: boolean;
};

export type FormField = {
  name: string;
  type: 'radio' | 'checkbox' | 'text' | 'number' | 'pricelist';
  options?: string[];
  placeholder?: string;
};

export type NestedSubcategory = {
  name: string;
  parameters: FormField[];
};

export type Subcategory = {
  name: string;
  nestedSubcategories?: NestedSubcategory[];
  parameters?: FormField[];
};

export type ListingType = 'Product' | 'Service' | 'Vehicle';
export type BusinessModel = 'B2C' | 'B2B' | 'Appointment' | 'RFQ' | 'Bulk Pricing' | 'MOQ' | 'Quote' | 'Token' | 'Meeting' | 'Sample';
export type FeatureRule = 'Product Stock' | 'Service' | 'Appointment' | 'Token' | 'RFQ' | 'B2C' | 'B2B' | 'Bulk Pricing' | 'MOQ' | 'Quote' | 'Meeting' | 'Sample' | 'Vehicle Test Drive';

export type Category = {
  id: string;
  primaryType: 'PRODUCT' | 'SERVICE' | 'VEHICLE';
  name: string;
  theme: string;
  icon: string;
  subcategories?: Subcategory[];
  parameters?: FormField[];
  // ── Relationship Manager fields ──
  allowedListingTypes?: ListingType[];
  businessModels?: BusinessModel[];
  workflow?: string;
  allowedFeatures?: FeatureRule[];
  notApplicable?: FeatureRule[];
  sectorId?: string;
  optionalFeatures?: FeatureRule[];
  defaultCommissionRate?: number;
  defaultFlatRate?: number;
};

type ProductContextType = {
  products: Product[];
  allProducts: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  editProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  userLocation: string;
  setUserLocation: (location: string) => void;
  userLat: number | null;
  setUserLat: (lat: number | null) => void;
  userLng: number | null;
  setUserLng: (lng: number | null) => void;
  radiusFilter: number | null;
  setRadiusFilter: (radius: number | null) => void;
  categories: Category[];
  allCategories: Category[];
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
};

export const defaultProducts: Product[] = [
  {
    id: 's100',
    name: 'Professional AC Repair',
    price: 499,
    originalPrice: 799,
    discount: '37% OFF',
    rating: '4.8',
    reviews: '(1.2k+)',
    seller: 'Cooling Experts Ltd',
    location: 'New Delhi, Delhi',
    category: 'Services',
    badge: 'NEW ARRIVAL',
    badgeColor: 'badge-gold',
    image: '/hero-left-logo.png'
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max 256GB',
    price: 134900,
    originalPrice: 159900,
    discount: '15% OFF',
    rating: '4.8',
    reviews: '12.5K',
    seller: 'Apple Authorized India',
    location: 'Mumbai, Maharashtra',
    category: 'Electronics',
    subcategory: 'Smartphones',
    badge: 'Trending',
    badgeColor: 'badge-purple',
    brand: 'Apple',
    parameters: {
      'Color': ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
      'Storage': ['256GB', '512GB', '1TB']
    }
  },
  {
    id: 'boat-airdopes-141',
    name: 'boAt Airdopes 141 Bluetooth Earbuds',
    price: 1299,
    originalPrice: 2999,
    discount: '57% OFF',
    rating: '4.6',
    reviews: '8.4K',
    seller: 'Appario Retail',
    location: 'Bengaluru, Karnataka',
    category: 'Electronics',
    subcategory: 'Audio',
    badge: 'Deal of the Day',
    badgeColor: 'badge-red',
    parameters: {
      'Color': ['Active Black', 'Cyan Cider']
    }
  },
  {
    id: 'mens-casual-shirt',
    name: "Men's Casual Cotton Shirt",
    price: 699,
    originalPrice: 1499,
    discount: '53% OFF',
    rating: '4.3',
    reviews: '2.1K',
    seller: 'Fashion Hub',
    location: 'Surat, Gujarat',
    category: 'Fashion',
    subcategory: 'Men',
    badge: 'Trending',
    badgeColor: 'badge-red',
    parameters: {
      'Color': ['White', 'Navy Blue', 'Olive Green', 'Maroon'],
      'Size': ['S', 'M', 'L', 'XL', 'XXL'],
      'Fabric': ['Cotton', 'Linen Blend']
    }
  },
  {
    id: 'kitchen-appliance-set',
    name: 'Kitchen Appliance Set (5 Pieces)',
    price: 2499,
    originalPrice: 4999,
    discount: '50% OFF',
    rating: '4.7',
    reviews: '3.6K',
    seller: 'Home Essentials Ltd',
    location: 'New Delhi, Delhi',
    category: 'Home',
    subcategory: 'Kitchen',
    badge: 'Top Rated',
    badgeColor: 'badge-gold',
    parameters: {
      'Color': ['Silver', 'Black']
    }
  },
  {
    id: 'ac-repair-service',
    name: 'Professional AC Repair & Servicing',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    rating: '4.9',
    reviews: '1.2K',
    seller: 'Urban Cool Services',
    location: 'Mumbai, Maharashtra',
    category: 'Home Services',
    subcategory: 'Repair',
    badge: 'Verified Expert',
    badgeColor: 'badge-gold',
    isPremium: true
  },
  {
    id: 'hair-cutting-styling',
    name: 'Men & Women Hair Cutting & Styling',
    price: 299,
    originalPrice: 599,
    discount: '50% OFF',
    rating: '4.8',
    reviews: '3.4K',
    seller: 'Elite Salon & Spa',
    location: 'Mumbai, Maharashtra',
    category: 'Services',
    subcategory: 'Salon',
    badge: 'Trending',
    badgeColor: 'badge-red',
    isPremium: true
  },
  {
    id: 'premium-pedicure',
    name: 'Premium Spa Pedicure & Manicure',
    price: 899,
    originalPrice: 1500,
    discount: '40% OFF',
    rating: '4.9',
    reviews: '890',
    seller: 'Elite Salon & Spa',
    location: 'Mumbai, Maharashtra',
    category: 'Services',
    subcategory: 'Spa'
  },
  {
    id: 'nail-art-extensions',
    name: 'Nail Cutting, Art & Gel Extensions',
    price: 1200,
    originalPrice: 2000,
    discount: '40% OFF',
    rating: '4.7',
    reviews: '450',
    seller: 'Glamour Nails Studio',
    location: 'Delhi, NCR',
    category: 'Services',
    badge: 'Highly Rated',
    badgeColor: 'badge-gold'
  },
  {
    id: 'city-auto-rentals',
    name: 'City Auto Rentals & Local Transport',
    price: 12,
    originalPrice: 15,
    discount: '20% OFF',
    rating: '4.6',
    reviews: '2.3K',
    seller: 'QuickRide Autos',
    location: 'Bangalore, Karnataka',
    category: 'Transport',
    badge: 'Trusted',
    badgeColor: 'badge-blue'
  },
  {
    id: 'heavy-freight-movers',
    name: 'Heavy Freight Trucking & Cargo Movers',
    price: 45,
    originalPrice: 60,
    discount: '25% OFF',
    rating: '4.9',
    reviews: '8.1K',
    seller: 'National Logistics Co.',
    location: 'Mumbai, Maharashtra',
    category: 'Transport',
    badge: 'Verified B2B',
    badgeColor: 'badge-gold'
  },
  {
    id: 'dream-events-weddings',
    name: 'Dream Events & Weddings Planner',
    price: 0,
    originalPrice: 0,
    discount: 'Custom',
    rating: '4.9',
    reviews: '340',
    seller: 'Dream Events Co.',
    location: 'Goa, India',
    category: 'Organizers',
    badge: 'Premium Provider',
    badgeColor: 'badge-gold'
  },
  {
    id: 'prime-construction',
    name: 'Prime Construction & Building Contractors',
    price: 0,
    originalPrice: 0,
    discount: 'Custom',
    rating: '4.7',
    reviews: '125',
    seller: 'Prime Builders Ltd.',
    location: 'Pune, Maharashtra',
    category: 'Organizers',
    badge: 'Certified',
    badgeColor: 'badge-blue'
  },
  {
    id: 'wholesale-clothing-bale',
    name: 'Wholesale Mixed Clothing Bale (100kg)',
    price: 15000,
    originalPrice: 25000,
    discount: '40% OFF',
    rating: '4.7',
    reviews: '89',
    seller: 'Surat Textiles Hub',
    location: 'Surat, Gujarat',
    category: 'B2B',
    badge: 'Global Verified',
    badgeColor: 'badge-purple',
    isB2B: true,
    moq: 12,
    wholesaleTiers: [
      { minQty: 12, margin: 20 },
      { minQty: 100, margin: 30 },
      { minQty: 150, margin: 40 }
    ]
  },
  {
    id: 'portland-cement-50kg',
    name: 'UltraTech Premium Portland Cement (50kg Bag)',
    price: 380,
    originalPrice: 420,
    discount: '10% OFF',
    rating: '4.8',
    reviews: '1.2K',
    seller: 'City Builders Mart',
    location: 'Mumbai, Maharashtra',
    category: 'Construction Materials',
    badge: 'Bestseller',
    badgeColor: 'badge-gold',
    isB2B: true,
    moq: 12,
    wholesaleTiers: [
      { minQty: 12, margin: 20 },
      { minQty: 100, margin: 30 },
      { minQty: 150, margin: 40 }
    ]
  },
  {
    id: 'tmt-steel-bars',
    name: 'Tata Tiscon 550SD TMT Steel Bars (Per Ton)',
    price: 65000,
    originalPrice: 70000,
    discount: '7% OFF',
    rating: '4.9',
    reviews: '850',
    seller: 'National Steel Traders',
    location: 'Pune, Maharashtra',
    category: 'Construction Materials',
    badge: 'Verified B2B',
    badgeColor: 'badge-gold',
    isB2B: true,
    moq: 12,
    wholesaleTiers: [
      { minQty: 12, margin: 20 },
      { minQty: 100, margin: 30 },
      { minQty: 150, margin: 40 }
    ]
  },
  {
    id: 'river-sand-truck',
    name: 'High Quality River Sand (Per Truck Load)',
    price: 18000,
    originalPrice: 20000,
    discount: '10% OFF',
    rating: '4.6',
    reviews: '420',
    seller: 'ABC Aggregates & Sand',
    location: 'Bangalore, Karnataka',
    category: 'Construction Materials',
    badge: 'Trusted',
    badgeColor: 'badge-blue',
    isB2B: true,
    moq: 12,
    wholesaleTiers: [
      { minQty: 12, margin: 20 },
      { minQty: 100, margin: 30 },
      { minQty: 150, margin: 40 }
    ]
  },
  {
    id: 'wholesale-cotton-fabric',
    name: 'Premium Cotton Fabric Rolls (Wholesale)',
    price: 150,
    originalPrice: 200,
    discount: '25% OFF',
    rating: '4.8',
    reviews: '56',
    seller: 'Textile Mills Corp',
    location: 'Surat, Gujarat',
    category: 'B2B',
    badge: 'Bulk Order Only',
    badgeColor: 'badge-gold'
  },
  {
    id: 'enterprise-server-rack',
    name: '42U Enterprise Server Rack Cabinet',
    price: 45000,
    originalPrice: 60000,
    discount: '25% OFF',
    rating: '4.9',
    reviews: '34',
    seller: 'TechInfra Solutions',
    location: 'Bangalore, Karnataka',
    category: 'B2B',
    badge: 'Verified B2B',
    badgeColor: 'badge-blue'
  },
  {
    id: 'premium-suv-rental',
    name: 'Premium SUV Self-Drive Rental',
    price: 3500,
    originalPrice: 5000,
    discount: '30% OFF',
    rating: '4.8',
    reviews: '1.2K',
    seller: 'ZoomDrive Rentals',
    location: 'Mumbai, Maharashtra',
    category: 'Rentals',
    badge: 'Top Choice',
    badgeColor: 'badge-gold',
    isPremium: true
  },
  {
    id: 'hr-retainer-service',
    name: 'Corporate HR & Payroll Retainer',
    price: 15000,
    originalPrice: 20000,
    discount: '25% OFF',
    rating: '4.9',
    reviews: '85',
    seller: 'ProStaffing Solutions',
    location: 'Delhi, NCR',
    category: 'Subscriptions',
    badge: 'Enterprise',
    badgeColor: 'badge-blue',
    isPremium: true
  }
];

const defaultCategories: Category[] = [
  // ── PRODUCT ──
  {
    id: 'c1',
    primaryType: 'PRODUCT',
    name: 'Electronics',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'MonitorSmartphone',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ', 'Bulk Pricing'],
    subcategories: [
      {
        name: 'Mobile',
        nestedSubcategories: [
          {
            name: 'Smartphone',
            parameters: [
              { name: 'RAM', type: 'radio', options: ['4 GB', '6 GB', '8 GB', '12 GB'] },
              { name: 'Storage', type: 'radio', options: ['64 GB', '128 GB', '256 GB', '512 GB'] },
              { name: 'Color', type: 'checkbox', options: ['Black', 'White', 'Blue', 'Green'] },
              { name: 'Warranty', type: 'text', placeholder: 'e.g. 1 Year Manufacturer Warranty' }
            ]
          },
          {
            name: 'Feature Phone',
            parameters: [
              { name: 'Color', type: 'checkbox', options: ['Black', 'Blue', 'Red'] },
              { name: 'Battery', type: 'radio', options: ['1000 mAh', '2000 mAh', '3000 mAh'] }
            ]
          }
        ]
      },
      { name: 'Laptop' },
      { name: 'TV' },
      { name: 'Camera' }
    ]
  },
  {
    id: 'c2',
    primaryType: 'PRODUCT',
    name: 'Construction',
    theme: 'bg-amber-50 text-amber-600',
    icon: 'HardHat',
    allowedListingTypes: ['Product'],
    businessModels: ['B2B', 'B2C', 'Bulk Pricing', 'MOQ', 'RFQ', 'Quote'],
    workflow: 'B2B / Manufacturer Workflow',
    allowedFeatures: ['Product Stock', 'B2B', 'B2C', 'RFQ', 'Bulk Pricing', 'MOQ', 'Quote'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['Meeting', 'Sample'],
    subcategories: [
      { name: 'Cement', parameters: [{ name: 'Grade', type: 'radio', options: ['43 Grade', '53 Grade', 'PPC'] }] },
      { name: 'Steel', parameters: [{ name: 'Type', type: 'radio', options: ['TMT Bars', 'Structural', 'Sheets'] }] },
      { name: 'Tiles' },
      { name: 'Pipes' }
    ]
  },
  {
    id: 'c3',
    primaryType: 'PRODUCT',
    name: 'Agriculture',
    theme: 'bg-lime-50 text-lime-600',
    icon: 'Leaf',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing', 'MOQ'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B', 'Bulk Pricing', 'MOQ'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ', 'Sample'],
    subcategories: [
      { name: 'Seeds' },
      { name: 'Fertilizer' },
      { name: 'Machinery' },
      { name: 'Irrigation' }
    ]
  },

  // ── SERVICE ──
  {
    id: 's1',
    primaryType: 'SERVICE',
    name: 'Salon',
    theme: 'bg-pink-50 text-pink-600',
    icon: 'Scissors',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Token'],
    workflow: 'Salon Booking Workflow',
    allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'B2B'],
    optionalFeatures: ['Meeting']
  },
  {
    id: 's2',
    primaryType: 'SERVICE',
    name: 'Spa',
    theme: 'bg-rose-50 text-rose-500',
    icon: 'Droplet',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Token'],
    workflow: 'Salon Booking Workflow',
    allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'B2B'],
    optionalFeatures: ['Meeting']
  },
  {
    id: 's3',
    primaryType: 'SERVICE',
    name: 'Doctor',
    theme: 'bg-emerald-50 text-emerald-600',
    icon: 'Stethoscope',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Token'],
    workflow: 'Doctor / Queue Workflow',
    allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'Bulk Pricing', 'B2B'],
    optionalFeatures: ['Meeting']
  },
  {
    id: 's4',
    primaryType: 'SERVICE',
    name: 'Plumber',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'Wrench',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's5',
    primaryType: 'SERVICE',
    name: 'Electrician',
    theme: 'bg-yellow-50 text-yellow-600',
    icon: 'Zap',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's6',
    primaryType: 'SERVICE',
    name: 'Carpenter',
    theme: 'bg-amber-50 text-amber-700',
    icon: 'Hammer',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's7',
    primaryType: 'SERVICE',
    name: 'Consultant',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'Briefcase',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'B2B', 'Quote', 'Meeting'],
    workflow: 'Meeting / Proposal Workflow',
    allowedFeatures: ['Service', 'B2C', 'B2B', 'Quote', 'Meeting'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'MOQ', 'Bulk Pricing'],
    optionalFeatures: ['RFQ', 'Appointment']
  },
  {
    id: 's8',
    primaryType: 'SERVICE',
    name: 'Freelancer',
    theme: 'bg-cyan-50 text-cyan-600',
    icon: 'Laptop',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'B2B', 'Quote', 'Meeting'],
    workflow: 'Meeting / Proposal Workflow',
    allowedFeatures: ['Service', 'B2C', 'B2B', 'Quote', 'Meeting'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'MOQ', 'Bulk Pricing'],
    optionalFeatures: ['RFQ', 'Appointment']
  },
  {
    id: 's9',
    primaryType: 'SERVICE',
    name: 'Mechanic',
    theme: 'bg-slate-100 text-slate-700',
    icon: 'Car',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's10',
    primaryType: 'SERVICE',
    name: 'Cleaner',
    theme: 'bg-teal-50 text-teal-600',
    icon: 'Droplet',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's11',
    primaryType: 'SERVICE',
    name: 'Painter',
    theme: 'bg-purple-50 text-purple-600',
    icon: 'Brush',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting']
  },
  {
    id: 's12',
    primaryType: 'SERVICE',
    name: 'Tutor',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'BookOpen',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment'],
    workflow: 'Appointment Workflow',
    allowedFeatures: ['Service', 'B2C', 'Appointment'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Meeting']
  },
  {
    id: 's13',
    primaryType: 'SERVICE',
    name: 'Photographer',
    theme: 'bg-neutral-50 text-neutral-800',
    icon: 'Camera',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Quote'],
    workflow: 'Appointment Workflow',
    allowedFeatures: ['Service', 'B2C', 'Appointment', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Meeting']
  },
  {
    id: 's14',
    primaryType: 'SERVICE',
    name: 'Event Planner',
    theme: 'bg-fuchsia-50 text-fuchsia-600',
    icon: 'Calendar',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'B2B', 'Appointment', 'Quote'],
    workflow: 'Meeting / Proposal Workflow',
    allowedFeatures: ['Service', 'B2C', 'B2B', 'Appointment', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'MOQ'],
    optionalFeatures: ['Meeting']
  },

  // ── VEHICLE ──
  {
    id: 'v1',
    primaryType: 'VEHICLE',
    name: 'Sales & Rentals',
    theme: 'bg-red-50 text-red-600',
    icon: 'Car',
    allowedListingTypes: ['Vehicle'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Vehicle Enquiry / Asset Workflow',
    allowedFeatures: ['Vehicle Test Drive', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Service', 'Token', 'B2B', 'Bulk Pricing', 'MOQ'],
    optionalFeatures: ['Meeting', 'Appointment'],
    subcategories: [
      { name: 'Car', parameters: [{ name: 'Fuel Type', type: 'radio', options: ['Petrol', 'Diesel', 'EV', 'Hybrid'] }, { name: 'Transmission', type: 'radio', options: ['Manual', 'Automatic'] }] },
      { name: 'Bike' },
      { name: 'Truck' },
      { name: 'Bus' },
      { name: 'Tractor' },
      { name: 'Construction Vehicle' }
    ]
  }
];

import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isSectorActive } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLat(latitude);
          setUserLng(longitude);
          
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          
          if (data) {
            const city = data.city || data.locality || data.principalSubdivision;
            const pincode = data.postcode || '';
            
            if (city) {
              setUserLocation(city + (pincode ? `, ${pincode}` : ''));
            }
          }
        } catch (error) {
          console.error("Auto-location fetch failed", error);
        }
      }, (err) => {
        console.log("Auto-location permission denied or failed:", err.message);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Fetch products
    console.log('Fetching products for location:', userLocation, userLat, userLng, radiusFilter);
    let url = `${API_URL}/products?location=${encodeURIComponent(userLocation)}`;
    if (userLat !== null && userLng !== null) {
      url += `&lat=${userLat}&lng=${userLng}`;
    }
    if (radiusFilter !== null) {
      url += `&radius=${radiusFilter}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          const mappedData = data.data.map((item: any) => ({
            ...item,
            seller: item.sellerName,
            category: item.categoryName,
            subcategory: item.subcategory,
            image: item.image || item.sku || undefined,
            images: item.images || (item.image ? [item.image] : []),
            isPremium: false,
            isB2B: item.isB2B,
            moq: item.moq,
            status: item.status
          }));
          if (mappedData.length > 0) {
            setProducts(mappedData);
          } else {
            setProducts(defaultProducts);
          }
        } else if (Array.isArray(data)) {
          const mappedData = data.map(item => ({
            ...item,
            seller: item.sellerName,
            category: item.categoryName,
            subcategory: item.subcategory,
            image: item.image || item.sku || undefined,
            images: item.images || (item.image ? [item.image] : []),
            isPremium: false,
            isB2B: item.isB2B,
            moq: item.moq,
            status: item.status
          }));
          if (mappedData.length > 0) {
            setProducts(mappedData);
          } else {
            setProducts(defaultProducts);
          }
        } else {
          setProducts(defaultProducts);
        }
      })
      .catch(err => {
        console.warn('Backend API note (using offline fallback data):', err.message);
        setProducts(defaultProducts);
      })
      .finally(() => setIsLoading(false));

    // Fetch categories
    console.log('Fetching categories from:', `${API_URL}/categories`);
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(defaultCategories);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories(defaultCategories);
      });
  }, [user?.id, userLocation, userLat, userLng, radiusFilter]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to add product');
      const newProduct = await res.json();
      setProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const editProduct = async (id: string, updated: Partial<Product>) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Failed to edit product');
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addCategory = async (cat: Category) => {
    try {
      // Handle fallback IDs for default categories
      const { id, ...dataToSave } = cat; 
      const payload = id.length > 20 ? cat : dataToSave; // Only keep id if it looks like a real MongoID
      
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add category');
      const newCategory = await res.json();
      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      console.error(err);
      // Fallback
      setCategories(prev => [...prev, cat]);
    }
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    try {
      // If it's a mock hardcoded category (id like 'p1', 's1'), we need to POST it first to 'upgrade' it to a DB category
      if (id.length < 20) {
        const fullCat = categories.find(c => c.id === id);
        if (fullCat) {
          const { id: oldId, ...dataToSave } = { ...fullCat, ...updated };
          const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
          });
          const newCat = await res.json();
          setCategories(prev => prev.map(c => c.id === oldId ? newCat : c));
          return;
        }
      }

      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Failed to update category');
      const updatedCat = await res.json();
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedCat } : c));
    } catch (err) {
      console.error(err);
      // Fallback
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      if (id.length > 20) {
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      }
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const activeCategories = useMemo(() => {
    return categories.filter(c => {
      if (c.name === 'Construction' || c.name === 'Agriculture') return isSectorActive('b2b');
      if (c.name === 'Beauty') return isSectorActive('salon');
      if (c.name === 'Home') return isSectorActive('home');
      if (c.name === 'Professional') return isSectorActive('events');
      if (c.name === 'Sales & Rentals') return isSectorActive('transport');
      return true;
    });
  }, [categories, isSectorActive]);

  const activeProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status === 'SUSPENDED') return false;
      if (p.isB2B && !isSectorActive('b2b')) return false;
      if (p.category === 'Beauty' && !isSectorActive('salon')) return false;
      if (p.category === 'Home' && !isSectorActive('home')) return false;
      if (p.category === 'Professional' && !isSectorActive('events')) return false;
      if (p.category === 'Rentals' && !isSectorActive('transport')) return false;
      if (p.category === 'B2B' && !isSectorActive('b2b')) return false;
      if (p.category === 'Construction Materials' && !isSectorActive('b2b')) return false;
      return true;
    });
  }, [products, isSectorActive]);

  return (
    <ProductContext.Provider value={{ isLoading, products: activeProducts, allProducts: products, addProduct, editProduct, deleteProduct, userLocation, setUserLocation, categories: activeCategories, allCategories: categories, addCategory, updateCategory,
      deleteCategory,
      userLat,
      setUserLat,
      userLng,
      setUserLng,
      radiusFilter,
      setRadiusFilter
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) throw new Error('useProducts must be used within a ProductProvider');
  return context;
}

export function useCategoryRules(categoryName: string | undefined) {
  const { categories } = useProducts();
  const cat = categories.find(c => c.name === categoryName);
  const allowedFeatures  = cat?.allowedFeatures  ?? [];
  const notApplicable    = cat?.notApplicable     ?? [];
  const optionalFeatures = cat?.optionalFeatures  ?? [];
  return {
    cat,
    allowedFeatures,
    notApplicable,
    optionalFeatures,
    businessModels: (cat?.businessModels ?? []) as BusinessModel[],
    workflow: cat?.workflow ?? '',
    allows:     (f: FeatureRule) => allowedFeatures.includes(f),
    isOptional: (f: FeatureRule) => optionalFeatures.includes(f),
    isBlocked:  (f: FeatureRule) => notApplicable.includes(f),
  };
}
