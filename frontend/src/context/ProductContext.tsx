"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getApiUrl, fastFetch } from '@/utils/api';

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
  contactPhone?: string;
  sellerPhone?: string;
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
    primaryType: 'SERVICE',
    category: 'Home Services',
    subcategory: 'Repair',
    badge: 'Verified Expert',
    badgeColor: 'badge-gold',
    isPremium: true
  },
  {
    id: 'urban-home-deep-cleaning',
    name: 'Full Home Deep Cleaning & Sanitization',
    price: 1999,
    originalPrice: 3500,
    discount: '43% OFF',
    rating: '4.8',
    reviews: '620',
    seller: 'SparkleClean Pros',
    location: 'Mumbai, Maharashtra',
    primaryType: 'SERVICE',
    category: 'Home Services',
    subcategory: 'Cleaning',
    badge: 'Popular',
    badgeColor: 'badge-blue',
    isPremium: true
  },
  {
    id: 'express-plumbing-service',
    name: 'Express Plumbing Repair & Leak Detection',
    price: 349,
    originalPrice: 599,
    discount: '42% OFF',
    rating: '4.7',
    reviews: '410',
    seller: 'City Plumbers Hub',
    location: 'Delhi, NCR',
    primaryType: 'SERVICE',
    category: 'Home Services',
    subcategory: 'Plumbing',
    badge: 'Quick Service',
    badgeColor: 'badge-gold'
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
    primaryType: 'SERVICE',
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
    primaryType: 'SERVICE',
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
    primaryType: 'SERVICE',
    category: 'Services',
    subcategory: 'Salon',
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
    primaryType: 'SERVICE',
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
    primaryType: 'SERVICE',
    isB2B: true,
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
    primaryType: 'SERVICE',
    category: 'Organizers',
    subcategory: 'Weddings & Parties',
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
    primaryType: 'SERVICE',
    isB2B: true,
    category: 'Construction Materials',
    subcategory: 'Contractors',
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
    badgeColor: 'badge-gold',
    isB2B: true,
    moq: 50,
    wholesaleTiers: [
      { minQty: 50, margin: 15 },
      { minQty: 100, margin: 25 }
    ]
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
    badgeColor: 'badge-blue',
    isB2B: true,
    moq: 2,
    wholesaleTiers: [
      { minQty: 2, margin: 10 },
      { minQty: 5, margin: 20 }
    ]
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

export const defaultCategories: Category[] = [
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
      {
        name: 'Laptop',
        parameters: [
          { name: 'Processor / CPU', type: 'radio', options: ['Intel Core i3 / Ryzen 3', 'Intel Core i5 / Ryzen 5', 'Intel Core i7 / Ryzen 7', 'Apple M-Series', 'Intel Core i9 / Extreme'] },
          { name: 'RAM Capacity', type: 'radio', options: ['8 GB DDR4/DDR5', '16 GB DDR4/DDR5', '32 GB Unified/DDR5', '64 GB+'] },
          { name: 'Storage SSD', type: 'radio', options: ['256 GB NVMe SSD', '512 GB NVMe SSD', '1 TB NVMe SSD', '2 TB+ SSD'] },
          { name: 'Screen Size', type: 'radio', options: ['13.3" - 14" Portable', '15.6" Standard', '16" - 17.3" Creator/Gaming'] },
          { name: 'Operating System', type: 'radio', options: ['Windows 11 Home', 'Windows 11 Pro', 'macOS', 'DOS / Linux'] },
          { name: 'Warranty Period', type: 'text', placeholder: 'e.g. 1 Year Onsite Manufacturer Warranty' }
        ]
      },
      { 
        name: 'TV',
        parameters: [
          { name: 'Screen Size (Inches)', type: 'radio', options: ['32 Inch', '43 Inch', '50 Inch', '55 Inch', '65 Inch', '75 Inch+'] },
          { name: 'Display Resolution', type: 'radio', options: ['HD Ready (720p)', 'Full HD (1080p)', '4K Ultra HD (2160p)', '8K Ultra HD'] },
          { name: 'Panel Technology', type: 'radio', options: ['LED / DLED', 'QLED', 'OLED', 'Mini-LED'] },
          { name: 'Smart TV OS', type: 'radio', options: ['Google TV / Android', 'LG webOS', 'Samsung Tizen OS', 'Fire OS', 'Standard Non-Smart'] },
          { name: 'Sound Output (Watts)', type: 'radio', options: ['20W Dolby Audio', '24W - 30W Sound', '40W+ with Subwoofer', 'Dolby Atmos Tuned'] },
          { name: 'Warranty', type: 'text', placeholder: 'e.g. 2 Years Comprehensive + 3 Years Panel' }
        ]
      },
      { 
        name: 'Camera',
        parameters: [
          { name: 'Camera Type', type: 'radio', options: ['Mirrorless Full-Frame', 'Mirrorless APS-C', 'DSLR Camera', 'Action Camera / GoPro', 'Point & Shoot Compact'] },
          { name: 'Sensor Resolution', type: 'radio', options: ['12 - 20 MP', '24 - 33 MP', '45 - 61 MP Ultra High Res'] },
          { name: 'Video Capabilities', type: 'radio', options: ['1080p 60fps', '4K 60fps', '4K 120fps / 8K Cinema'] },
          { name: 'Kit Lens Included', type: 'radio', options: ['Body Only (No Lens)', 'Standard Zoom Kit (18-55mm / 24-70mm)', 'Dual Lens Kit'] }
        ]
      }
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
      { name: 'Cement', parameters: [{ name: 'Grade', type: 'radio', options: ['43 Grade', '53 Grade', 'PPC', 'White Cement'] }, { name: 'Packaging Type', type: 'radio', options: ['50 Kg Bag', 'Bulk Tanker / Loose'] }, { name: 'Brand / ISI Standard', type: 'text', placeholder: 'e.g. UltraTech, Ambuja, ACC' }] },
      { name: 'Steel & TMT', parameters: [{ name: 'Type', type: 'radio', options: ['Fe-500D TMT', 'Fe-550D TMT', 'Structural Steel', 'MS Sheets / Plates'] }, { name: 'Diameter / Thickness', type: 'radio', options: ['8 mm', '10 mm', '12 mm', '16 mm', '20 mm', '25 mm', '32 mm'] }] },
      { name: 'Tiles & Marbles', parameters: [{ name: 'Material', type: 'radio', options: ['Vitrified', 'Ceramic', 'Granite', 'Italian Marble'] }, { name: 'Finish', type: 'radio', options: ['Glossy', 'Matte', 'Rustic', 'Sugar Finish'] }] },
      { name: 'Pipes & Fittings', parameters: [{ name: 'Material', type: 'radio', options: ['CPVC', 'UPVC', 'PVC', 'GI', 'Cast Iron'] }, { name: 'Pressure Class', type: 'radio', options: ['SDR 11', 'SDR 13.5', 'Schedule 40', 'Schedule 80'] }] },
      { name: 'Paints & Wall Primer', parameters: [{ name: 'Type', type: 'radio', options: ['Interior Emulsion', 'Exterior Weatherproof', 'Waterproof Primer', 'Enamel Paint'] }, { name: 'Pack Size', type: 'radio', options: ['1 Litre', '4 Litres', '10 Litres', '20 Litres'] }] },
      { name: 'Bricks & Blocks', parameters: [{ name: 'Type', type: 'radio', options: ['Red Clay Bricks', 'AAC Fly Ash Blocks', 'Solid Concrete Blocks'] }] }
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
      { name: 'Seeds', parameters: [{ name: 'Crop Type', type: 'radio', options: ['Cereals & Grains', 'Pulses', 'Vegetable Seeds', 'Oilseeds', 'Cotton / Cash Crop'] }, { name: 'Seed Treatment', type: 'radio', options: ['Hybrid Certified', 'Organic Untreated', 'Fungicide Treated'] }] },
      { name: 'Fertilizer & Nutrition', parameters: [{ name: 'Type', type: 'radio', options: ['Organic Compost', 'Bio-Fertilizer', 'Chemical NPK', 'Micronutrients Spray'] }, { name: 'Form', type: 'radio', options: ['Granular', 'Liquid', 'Water Soluble Powder'] }] },
      { name: 'Machinery & Equipment', parameters: [{ name: 'Category', type: 'radio', options: ['Tractor Attachment', 'Power Tiller', 'Sprayer Pump', 'Harvesting Tool'] }, { name: 'Power Source', type: 'radio', options: ['Manual', 'Battery Operated', 'Diesel / Petrol Engine', 'PTO Driven'] }] },
      { name: 'Irrigation & Drip', parameters: [{ name: 'System Type', type: 'radio', options: ['Drip Irrigation Line', 'Sprinkler System', 'Submersible Pump', 'HDPE Pipes'] }] }
    ]
  },
  {
    id: 'c4',
    primaryType: 'PRODUCT',
    name: 'Fashion',
    theme: 'bg-violet-50 text-violet-600',
    icon: 'Shirt',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B', 'Bulk Pricing'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ', 'Sample'],
    subcategories: [
      { name: 'Men Clothing', parameters: [{ name: 'Available Sizes', type: 'checkbox', options: ['S', 'M', 'L', 'XL', 'XXL', '3XL'] }, { name: 'Fabric Material', type: 'radio', options: ['100% Pure Cotton', 'Linen', 'Polyester Blend', 'Denim', 'Silk Blend'] }, { name: 'Fit Type', type: 'radio', options: ['Regular Fit', 'Slim Fit', 'Oversized', 'Tailored'] }] },
      { name: 'Women Clothing', parameters: [{ name: 'Available Sizes', type: 'checkbox', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] }, { name: 'Fabric Material', type: 'radio', options: ['Pure Cotton', 'Georgette', 'Chiffon', 'Silk', 'Rayon'] }, { name: 'Occasion', type: 'radio', options: ['Daily Casual', 'Festive / Ethnic', 'Formal Workwear', 'Party Wear'] }] },
      { name: 'Footwear', parameters: [{ name: 'Shoe Size (UK/India)', type: 'checkbox', options: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] }, { name: 'Type', type: 'radio', options: ['Sneakers / Sports', 'Formal Leather', 'Sandals / Floaters', 'Ethnic Jutti'] }] },
      { name: 'Accessories', parameters: [{ name: 'Category', type: 'radio', options: ['Watches', 'Sunglasses', 'Belts & Wallets', 'Bags & Backpacks'] }] }
    ]
  },
  {
    id: 'c5',
    primaryType: 'PRODUCT',
    name: 'Home & Kitchen',
    theme: 'bg-orange-50 text-orange-600',
    icon: 'Home',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ'],
    subcategories: [
      { name: 'Kitchen Appliances', parameters: [{ name: 'Power Consumption', type: 'radio', options: ['Under 500W', '500W - 750W', '750W - 1000W', 'Above 1000W'] }, { name: 'Warranty Period', type: 'radio', options: ['1 Year', '2 Years', '5 Years Comprehensive'] }] },
      { name: 'Cookware & Tableware', parameters: [{ name: 'Material', type: 'radio', options: ['Triply Stainless Steel', 'Cast Iron', 'Hard Anodized', 'Ceramic Non-Stick'] }, { name: 'Induction Compatible', type: 'radio', options: ['Yes (Gas & Induction)', 'Gas Stove Only'] }] },
      { name: 'Furniture & Decor', parameters: [{ name: 'Wood / Material Type', type: 'radio', options: ['Solid Sheesham Wood', 'Teak Wood', 'Engineered Wood', 'Metal Frame'] }, { name: 'Assembly', type: 'radio', options: ['Pre-assembled', 'DIY with Manual', 'Carpenter Required'] }] }
    ]
  },
  {
    id: 'c6',
    primaryType: 'PRODUCT',
    name: 'Grocery & FMCG',
    theme: 'bg-emerald-50 text-emerald-600',
    icon: 'ShoppingBag',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['Bulk Pricing', 'Sample'],
    subcategories: [
      { name: 'Staples & Grains', parameters: [{ name: 'Weight / Pack', type: 'radio', options: ['500 g', '1 Kg', '5 Kg', '10 Kg Bag', '25 Kg Bag'] }, { name: 'Dietary Preference', type: 'radio', options: ['100% Organic', 'Natural / Unpolished', 'Regular Commercial'] }] },
      { name: 'Edible Oils & Ghee', parameters: [{ name: 'Oil Type', type: 'radio', options: ['Cold Pressed Mustard', 'Refined Sunflower', 'Groundnut Oil', 'Desi Cow Ghee (A2)'] }, { name: 'Volume', type: 'radio', options: ['500 ml', '1 Litre Pouch', '1 Litre Bottle', '5 Litre Can', '15 Litre Tin'] }] },
      { name: 'Snacks & Packaged Food', parameters: [{ name: 'Food Preference', type: 'radio', options: ['Vegetarian (Green Dot)', 'Non-Vegetarian'] }, { name: 'Shelf Life', type: 'radio', options: ['1-3 Months', '6 Months', '12 Months'] }] },
      { name: 'Beverages & Tea/Coffee', parameters: [{ name: 'Type', type: 'radio', options: ['CTC Tea Leaf', 'Green Tea', 'Filter Coffee / Instant', 'Juices & Syrups'] }, { name: 'Packaging', type: 'radio', options: ['Tin Caddy', 'Pouch', 'Glass Bottle', 'Tetrapack'] }] }
    ]
  },
  {
    id: 'c7',
    primaryType: 'PRODUCT',
    name: 'Healthcare & Medical Devices',
    theme: 'bg-teal-50 text-teal-600',
    icon: 'ShieldPlus',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B', 'Bulk Pricing'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ', 'Sample'],
    subcategories: [
      { name: 'Medical Equipment & Monitors', parameters: [
        { name: 'Device Type', type: 'radio', options: ['Digital BP Monitor', 'Pulse Oximeter', 'Blood Glucose Meter / Strips', 'Nebulizer Machine', 'Infrared Thermometer', 'Oxygen Concentrator'] },
        { name: 'Power Source', type: 'radio', options: ['Battery Operated', 'USB Rechargeable', 'AC Mains Plug', 'Dual Battery / AC'] },
        { name: 'Certifications', type: 'checkbox', options: ['FDA Approved', 'CE Certified', 'ISO 13485', 'CDSCO Registered'] },
        { name: 'Warranty Period', type: 'text', placeholder: 'e.g. 2 Years Manufacturer Warranty' }
      ]},
      { name: 'Surgical & Clinic Supplies', parameters: [
        { name: 'Supply Category', type: 'radio', options: ['Nitrile / Latex Gloves', 'Surgical Masks (3-Ply / N95)', 'Sterilization Pouches & Autoclave', 'Syringes & Cannulas', 'Bandages & Wound Dressing'] },
        { name: 'Sterility Status', type: 'radio', options: ['EO Gas Sterile', 'Gamma Irradiated', 'Non-Sterile Bulk'] },
        { name: 'Pack Quantity', type: 'radio', options: ['Pack of 50', 'Pack of 100', 'Master Carton (1000 pcs)'] }
      ]},
      { name: 'Wellness & Nutrition Supplements', parameters: [
        { name: 'Supplement Type', type: 'radio', options: ['Whey Protein / Plant Protein', 'Multivitamins & Minerals', 'Omega-3 Fish Oil', 'Immunity Boosters (Chyawanprash/Herbs)', 'Collagen & Biotin'] },
        { name: 'Form Factor', type: 'radio', options: ['Tablets / Capsules', 'Powder', 'Gummies', 'Liquid Drops'] },
        { name: 'FSSAI License No.', type: 'text', placeholder: 'e.g. 10019022009876' }
      ]}
    ]
  },
  {
    id: 'c8',
    primaryType: 'PRODUCT',
    name: 'Automotive Parts & Accessories',
    theme: 'bg-slate-100 text-slate-800',
    icon: 'Wrench',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing', 'MOQ'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B', 'Bulk Pricing', 'MOQ'],
    notApplicable: ['Service', 'Appointment', 'Token'],
    optionalFeatures: ['RFQ'],
    subcategories: [
      { name: 'Car Spare Parts', parameters: [
        { name: 'Part Type', type: 'radio', options: ['Brake Pads & Rotors', 'Engine Oil & Air Filters', 'Spark Plugs & Ignition Coil', 'Clutch Plates & Flywheel', 'Shock Absorbers & Struts', 'Headlight & Taillight Assembly'] },
        { name: 'Vehicle Compatibility', type: 'text', placeholder: 'e.g. Maruti Swift (2018-2023), Hyundai Creta' },
        { name: 'Condition / OEM', type: 'radio', options: ['OEM Genuine Parts', 'Aftermarket High Performance', 'Certified Replacement'] }
      ]},
      { name: 'Two-Wheeler Spares', parameters: [
        { name: 'Component', type: 'radio', options: ['Drive Chain & Sprocket Kit', 'Disc Brake Pads / Shoes', 'Exhaust Silencer', 'Carburetor / Injector', 'Batteries & Self Starter'] },
        { name: 'Compatible Bike/Scooter', type: 'text', placeholder: 'e.g. Hero Splendor, Royal Enfield Classic 350, Honda Activa' }
      ]},
      { name: 'Car Electronics & Interior', parameters: [
        { name: 'Accessory', type: 'radio', options: ['Android Infotainment Touchscreen', 'Dashcam Dual Channel', 'Seat Covers Custom Fit', 'Reverse Parking Sensors / Camera', 'High Power LED Headlight Bulbs'] },
        { name: 'Operating Voltage', type: 'radio', options: ['12V Car Socket', '24V Truck/Commercial', 'Direct Battery Hardwire'] }
      ]},
      { name: 'Lubricants & Car Care', parameters: [
        { name: 'Product Type', type: 'radio', options: ['Fully Synthetic Engine Oil (5W-30 / 0W-20)', 'Semi-Synthetic Oil (10W-40)', 'Coolant & Brake Fluid (DOT 4)', 'Ceramic Coating & Polish Wax'] },
        { name: 'Volume Capacity', type: 'radio', options: ['1 Litre', '3.5 Litres', '4 Litres Can', '5 Litres Can'] }
      ]}
    ]
  },
  {
    id: 'c9',
    primaryType: 'PRODUCT',
    name: 'Industrial Machinery & Tools',
    theme: 'bg-zinc-100 text-zinc-800',
    icon: 'Cpu',
    allowedListingTypes: ['Product'],
    businessModels: ['B2B', 'Bulk Pricing', 'MOQ', 'RFQ'],
    workflow: 'B2B / Manufacturer Workflow',
    allowedFeatures: ['Product Stock', 'B2B', 'Bulk Pricing', 'MOQ', 'RFQ', 'Quote'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['Meeting', 'Sample'],
    subcategories: [
      { name: 'Power Tools & Workshop Equipment', parameters: [
        { name: 'Tool Category', type: 'radio', options: ['Angle Grinder', 'Rotary Hammer Drill', 'Cordless Impact Driver', 'Cut-off Machine / Marble Cutter', 'Welding Inverter Machine'] },
        { name: 'Power Rating (Watts)', type: 'radio', options: ['500W - 850W', '900W - 1400W', '1500W - 2400W Heavy Duty'] },
        { name: 'Power Source', type: 'radio', options: ['220V Corded Electric', '18V/20V Li-Ion Battery Cordless', 'Pneumatic Air Powered'] }
      ]},
      { name: 'Generators & Electric Motors', parameters: [
        { name: 'Equipment Type', type: 'radio', options: ['Silent Diesel Generator (DG Set)', 'Portable Petrol Generator', 'Three-Phase Induction Motor', 'Variable Frequency Drive (VFD)'] },
        { name: 'Capacity / KVA', type: 'radio', options: ['2 KVA - 5 KVA', '7.5 KVA - 15 KVA', '25 KVA - 62.5 KVA', '125 KVA+ Industrial'] },
        { name: 'Starting System', type: 'radio', options: ['Electric Key Start', 'Auto Mains Failure (AMF)', 'Recoil Pull Start'] }
      ]},
      { name: 'Packaging & Warehouse Material', parameters: [
        { name: 'Item Type', type: 'radio', options: ['BOPP Packaging Tape', 'Stretch Film Cling Roll', 'Corrugated Shipping Boxes (3-Ply/5-Ply)', 'Strapping Machine Rolls', 'Hydraulic Hand Pallet Truck'] },
        { name: 'Load Capacity', type: 'radio', options: ['500 Kg', '1 Ton', '2.5 Tons', '3 Tons'] }
      ]}
    ]
  },
  {
    id: 'c10',
    primaryType: 'PRODUCT',
    name: 'Beauty, Cosmetics & Personal Care',
    theme: 'bg-rose-50 text-rose-600',
    icon: 'Sparkles',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B', 'Bulk Pricing'],
    notApplicable: ['Service', 'Appointment', 'Token', 'Vehicle Test Drive'],
    optionalFeatures: ['RFQ', 'Sample'],
    subcategories: [
      { name: 'Skincare & Face Care', parameters: [
        { name: 'Category', type: 'radio', options: ['Face Serum (Vitamin C/Hyaluronic)', 'Moisturizer / Cream', 'Sunscreen SPF 50+', 'Face Cleanser / Foaming Wash', 'Sheet Mask / Peel-off'] },
        { name: 'Skin Type', type: 'radio', options: ['All Skin Types', 'Oily & Acne-Prone', 'Dry & Sensitive', 'Combination'] },
        { name: 'Formulation Traits', type: 'checkbox', options: ['Dermatologically Tested', 'Cruelty Free & Vegan', 'Paraben & Sulphate Free', 'Organic Certified'] }
      ]},
      { name: 'Hair Care Products', parameters: [
        { name: 'Product Type', type: 'radio', options: ['Anti-Dandruff Shampoo', 'Keratin / Smoothing Conditioner', 'Hair Growth Oil / Serum', 'Hair Mask / Deep Spa', 'Styling Wax & Clay'] },
        { name: 'Key Active Ingredients', type: 'text', placeholder: 'e.g. Red Onion, Rosemary Oil, Biotin, Argan Oil' }
      ]},
      { name: 'Color Cosmetics & Makeup', parameters: [
        { name: 'Makeup Item', type: 'radio', options: ['Matte Liquid Lipstick', 'Foundation & Concealer', 'Eyeliner & Kajal', 'Eyeshadow Palette', 'Setting Powder & Primer'] },
        { name: 'Shade / Color Tone', type: 'text', placeholder: 'e.g. Nude Pink, Warm Caramel, Classic Red' }
      ]},
      { name: 'Fragrances & Deodorants', parameters: [
        { name: 'Fragrance Concentration', type: 'radio', options: ['Eau De Parfum (EDP)', 'Eau De Toilette (EDT)', 'Body Mist / Spray', 'Non-Alcoholic Attar Roll-on'] },
        { name: 'Scent Family', type: 'radio', options: ['Fresh Citrus & Aquatic', 'Warm Woody & Oud', 'Floral & Fruity', 'Spicy Oriental'] }
      ]}
    ]
  },
  {
    id: 'c11',
    primaryType: 'PRODUCT',
    name: 'Sports, Fitness & Outdoor',
    theme: 'bg-emerald-50 text-emerald-700',
    icon: 'Activity',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token'],
    optionalFeatures: ['RFQ'],
    subcategories: [
      { name: 'Gym & Fitness Gear', parameters: [
        { name: 'Equipment Category', type: 'radio', options: ['Dumbbells & Barbells (Rubber/Hex)', 'Resistance Bands Set', 'Yoga Mat (Anti-Slip 6mm/8mm)', 'Motorized Treadmill', 'Exercise Air Bike / Spin Bike'] },
        { name: 'Weight / Spec', type: 'text', placeholder: 'e.g. 5kg Pair, 10kg-50kg Set, Max User Weight 120kg' }
      ]},
      { name: 'Racquet & Ball Sports', parameters: [
        { name: 'Sport Type', type: 'radio', options: ['Cricket (English/Kashmir Willow)', 'Badminton (Graphite Racquets)', 'Football / Futsal (Size 5)', 'Tennis / Table Tennis', 'Basketball'] },
        { name: 'Player Level', type: 'radio', options: ['Beginner / Recreational', 'Intermediate Club Player', 'Professional Match Grade'] }
      ]}
    ]
  },
  {
    id: 'c12',
    primaryType: 'PRODUCT',
    name: 'Books, Stationery & Office Supplies',
    theme: 'bg-amber-50 text-amber-800',
    icon: 'BookOpen',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B', 'Bulk Pricing'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token'],
    optionalFeatures: ['Bulk Pricing'],
    subcategories: [
      { name: 'Books & Educational Material', parameters: [
        { name: 'Genre / Category', type: 'radio', options: ['School / College Textbooks', 'Competitive Exam Preparation', 'Fiction & Literature', 'Self-Help & Business Growth', 'Children Story Books'] },
        { name: 'Language', type: 'radio', options: ['English', 'Hindi', 'Regional Languages', 'Bilingual'] },
        { name: 'Binding', type: 'radio', options: ['Paperback', 'Hardcover', 'Spiral Bound'] }
      ]},
      { name: 'Office Stationery & Paper Products', parameters: [
        { name: 'Item Type', type: 'radio', options: ['A4 Copy Paper (70/75/80 GSM)', 'Spiral Notebooks & Registers', 'Gel / Ballpoint Pens (Pack)', 'Files, Folders & Document Bags', 'Desk Organizers & Whiteboards'] },
        { name: 'Pack Quantity', type: 'radio', options: ['Single Unit', 'Pack of 5 / 10', 'Box of 500 Sheets (1 Ream)', 'Carton of 5 Reams'] }
      ]}
    ]
  },
  {
    id: 'c13',
    primaryType: 'PRODUCT',
    name: 'Baby Care & Toys',
    theme: 'bg-sky-50 text-sky-600',
    icon: 'Baby',
    allowedListingTypes: ['Product'],
    businessModels: ['B2C', 'B2B'],
    workflow: 'Product Sales Workflow',
    allowedFeatures: ['Product Stock', 'B2C', 'B2B'],
    notApplicable: ['Service', 'Appointment', 'Token'],
    optionalFeatures: ['Bulk Pricing'],
    subcategories: [
      { name: 'Baby Essentials & Diapers', parameters: [
        { name: 'Item', type: 'radio', options: ['Pant Style Diapers', 'Baby Wet Wipes (Water Based)', 'Bathing Wash & Gentle Shampoo', 'Feeding Bottles (BPA Free)', 'Teethers & Pacifiers'] },
        { name: 'Size / Age Group', type: 'radio', options: ['Newborn (NB)', 'Small (S) 4-8kg', 'Medium (M) 7-12kg', 'Large (L) 9-14kg', 'XL 12-17kg'] }
      ]},
      { name: 'Educational Toys & Games', parameters: [
        { name: 'Toy Type', type: 'radio', options: ['Building Blocks & LEGO', 'Remote Control Cars & Drones', 'Board Games & Puzzles', 'Musical Learning Toys', 'Soft Plush Toys'] },
        { name: 'Recommended Age', type: 'radio', options: ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', 'Teens & Family'] },
        { name: 'Safety Standards', type: 'checkbox', options: ['BIS Certified (ISI Mark)', 'Non-Toxic BPA Free Plastic', 'Smooth Rounded Edges'] }
      ]}
    ]
  },

  // ── SERVICE ──
  {
    id: 's1',
    primaryType: 'SERVICE',
    name: 'Salon & Parlour',
    theme: 'bg-pink-50 text-pink-600',
    icon: 'Scissors',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Token'],
    workflow: 'Salon Booking Workflow',
    allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'B2B'],
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Salon', 
        parameters: [
          { name: 'Target Audience', type: 'radio', options: ['Men Only', 'Women Only', 'Unisex'] },
          { name: 'Service Location', type: 'radio', options: ['In-Salon Only', 'At-Home Service Available', 'Both Salon & Home'] },
          { name: 'Salon Amenities', type: 'checkbox', options: ['Air Conditioned', 'Free Wi-Fi', 'Complimentary Beverages', 'Parking Available'] }
        ] 
      },
      { 
        name: 'Beauty Parlour', 
        parameters: [
          { name: 'Service Category', type: 'radio', options: ['Facial & Skincare', 'Waxing & Threading', 'Bridal & Party Makeup', 'Manicure & Pedicure', 'Nail Art Studio', 'De-Tan & Bleach'] },
          { name: 'Products Used', type: 'radio', options: ['Premium Herbal / Organic', 'International Brands (L\'Oreal, MAC, Cheryl\'s)', 'Standard Salon Grade'] },
          { name: 'Service Location', type: 'radio', options: ['In-Parlour Only', 'At-Home Service Available', 'Both Parlour & Home'] }
        ] 
      },
      { 
        name: 'Spa', 
        parameters: [
          { name: 'Therapy Type', type: 'radio', options: ['Ayurvedic Panchakarma', 'Swedish Deep Tissue', 'Aromatherapy Relaxation', 'Thai Yoga Massage', 'Foot Reflexology'] },
          { name: 'Session Duration', type: 'radio', options: ['30 Minutes', '45 Minutes', '60 Minutes', '90 Minutes', '120 Minutes'] },
          { name: 'Facilities Available', type: 'checkbox', options: ['Steam Bath', 'Sauna Room', 'Jacuzzi', 'Shower En-suite'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Ayurvedic & Body Spa', 
        parameters: [
          { name: 'Therapy Type', type: 'radio', options: ['Ayurvedic Panchakarma', 'Swedish Deep Tissue', 'Aromatherapy Relaxation', 'Thai Yoga Massage'] },
          { name: 'Session Duration', type: 'radio', options: ['45 Minutes', '60 Minutes', '90 Minutes', '120 Minutes'] },
          { name: 'Facilities Available', type: 'checkbox', options: ['Steam Bath', 'Sauna Room', 'Jacuzzi', 'Shower En-suite'] }
        ] 
      },
      { 
        name: 'Foot Reflexology', 
        parameters: [
          { name: 'Session Duration', type: 'radio', options: ['30 Minutes', '45 Minutes', '60 Minutes'] },
          { name: 'Oil / Cream Type', type: 'radio', options: ['Herbal Medicated Oil', 'Essential Aroma Oil', 'Shea Butter Cream'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Clinic & OPD Consultation', 
        parameters: [
          { name: 'Specialization Field', type: 'radio', options: ['General Physician', 'Cardiologist', 'Pediatrician (Child Specialist)', 'Dermatologist (Skin)', 'Orthopedic (Bone & Joint)', 'Gynecologist', 'ENT Specialist'] },
          { name: 'Consultation Mode', type: 'radio', options: ['In-Clinic Consultation', 'Online Video Consultation', 'Both In-Clinic & Online'] },
          { name: 'Emergency Support', type: 'radio', options: ['Available 24x7', 'During Clinic Hours Only'] }
        ] 
      },
      { 
        name: 'Dental Care & Surgery', 
        parameters: [
          { name: 'Treatment Categories', type: 'checkbox', options: ['Routine Scaling & Polishing', 'Cavity Fillings', 'Root Canal Treatment (RCT)', 'Braces & Aligners', 'Teeth Whitening', 'Tooth Extraction'] },
          { name: 'Diagnostic Equipment', type: 'checkbox', options: ['Digital RVG X-Ray On-site', 'Intra-Oral Camera', 'Rotary Endodontics'] }
        ] 
      },
      { 
        name: 'Physiotherapy & Rehab', 
        parameters: [
          { name: 'Service Type', type: 'radio', options: ['Clinic Sessions', 'Home Visit Physiotherapy', 'Both Clinic & Home'] },
          { name: 'Therapy Modalities', type: 'checkbox', options: ['IFT / TENS Electrotherapy', 'Ultrasound Therapy', 'Traction Bed', 'Dry Needling & Cupping'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Plumbing Repair & Installation', 
        parameters: [
          { name: 'Service Scope', type: 'checkbox', options: ['Tap & Shower Leakage Fix', 'Toilet Flush & Commode Installation', 'Water Tank Cleaning & Overflow Alarm', 'Pipe Blockage Removal', 'Geyser Inlet / Outlet Fitting'] },
          { name: 'Warranty On Repair', type: 'radio', options: ['30 Days Service Warranty', 'No Warranty (Labour Only)'] },
          { name: 'Urgent Emergency Visit', type: 'radio', options: ['Available within 60 Mins', 'Standard Scheduled Visit'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Electrical Repairs & Wiring', 
        parameters: [
          { name: 'Services Offered', type: 'checkbox', options: ['Fan / Chandelier Installation', 'Switchboard Repair & MCB Tripping Fix', 'Complete House Concealed Wiring', 'Inverter / Battery Setup', 'Appliance Power Wiring (AC, Geyser)'] },
          { name: 'Electrician Certification', type: 'radio', options: ['Licensed / Govt Wireman Certified', 'Experienced Technician'] },
          { name: 'Safety Measures', type: 'checkbox', options: ['Insulated VDE Tested Tools', 'Rubber Safety Boots', 'Voltage Tester Check'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Carpentry & Woodwork', 
        parameters: [
          { name: 'Scope of Work', type: 'checkbox', options: ['Door Lock & Handle Fitting', 'Furniture Repair & Polish', 'Modular Kitchen Cabinetry', 'Wardrobe & Drawer Fixing', 'Custom Bed & Sofa Frame Crafting'] },
          { name: 'Billing Basis', type: 'radio', options: ['Hourly Labour Rate', 'Fixed Scope Quote', 'Per Square Foot (Custom Furniture)'] }
        ] 
      }
    ]
  },
  {
    id: 's-professional',
    primaryType: 'SERVICE',
    name: 'Professional',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'Briefcase',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'B2B', 'Quote', 'Meeting'],
    workflow: 'Meeting / Proposal Workflow',
    allowedFeatures: ['Service', 'B2C', 'B2B', 'Quote', 'Meeting'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'MOQ', 'Bulk Pricing'],
    optionalFeatures: ['RFQ', 'Appointment'],
    subcategories: [
      { 
        name: 'Freelancer (IT & Web Developer)', 
        parameters: [
          { name: 'Tech Stack / Skill', type: 'checkbox', options: ['Full-Stack Web (Next.js/React/Node)', 'WordPress / Shopify / WooCommerce', 'Backend APIs & Cloud Databases', 'DevOps & AWS/Cloud Setup', 'Bug Fixing & Code Audit'] },
          { name: 'Engagement Model', type: 'radio', options: ['Fixed Project Milestone', 'Hourly Consultation Call', 'Monthly Dedicated Retainer'] }
        ] 
      },
      { 
        name: 'Freelancer (Video & Photo Editor)', 
        parameters: [
          { name: 'Editing Scope', type: 'checkbox', options: ['Instagram Reels & TikTok Shorts (Vertical)', 'YouTube Long-Form Storytelling', 'Podcast Audio/Video Sync & Multicam', 'Commercials & Product Promos', 'Color Grading & Audio Mastering'] },
          { name: 'Deliverable Turnaround', type: 'radio', options: ['24-48 Hours Express', '3-5 Business Days', 'Weekly Project Cycle'] }
        ] 
      },
      { 
        name: 'Freelancer (UI/UX & Graphic Designer)', 
        parameters: [
          { name: 'Design Services', type: 'checkbox', options: ['Figma Web & App UI/UX Design', 'Brand Logo & Visual Identity Guidelines', 'Social Media Creatives & Ad Banners', 'Pitch Decks & Presentations', 'Product Packaging & Print Collateral'] }
        ] 
      },
      { 
        name: 'Freelancer (Content Writer & SEO)', 
        parameters: [
          { name: 'Writing Domain', type: 'checkbox', options: ['SEO Blog Posts & Thought Leadership', 'High-Converting Landing Page Copy', 'Email Marketing Funnels & Newsletters', 'Technical Documentation & Whitepapers'] }
        ] 
      },
      { 
        name: 'Lawyer', 
        parameters: [
          { name: 'Legal Domain', type: 'radio', options: ['Civil & Property Dispute', 'Criminal Defense', 'Corporate & Contract Law', 'Family & Matrimonial', 'Consumer Court & RERA'] },
          { name: 'Consultation Mode', type: 'radio', options: ['In-Chamber Office Meeting', 'Online Video Call (Google Meet)', 'Phone Advisory'] },
          { name: 'Court Jurisdiction', type: 'text', placeholder: 'e.g. High Court, District Sessions Court, Supreme Court' }
        ] 
      },
      { 
        name: 'Chartered Accountant (CA)', 
        parameters: [
          { name: 'CA Specialization', type: 'checkbox', options: ['ITR Income Tax Filing', 'GST Return Filing & Notice', 'Company / LLP Incorporation', 'Audited Balance Sheet (P&L)', 'ROC & MCA Compliance', 'Virtual CFO & Advisory'] },
          { name: 'Consultation Mode', type: 'radio', options: ['In-Office Chamber Meeting', 'Online Video Call (Zoom/Meet)', 'Phone Consultation'] }
        ] 
      },
      { 
        name: 'Tax Consultant & GST Practitioner', 
        parameters: [
          { name: 'Tax Services', type: 'checkbox', options: ['GST Registration & Returns', 'Income Tax Filing & Assessment', 'TDS & TCS Compliance', 'Tax Notice Resolution'] },
          { name: 'Mode', type: 'radio', options: ['Online Consultation', 'Office Visit', 'Phone Advisory'] }
        ] 
      },
      { 
        name: 'Company Secretary (CS)', 
        parameters: [
          { name: 'Compliance Area', type: 'checkbox', options: ['Company / Startup Incorporation', 'Annual MCA ROC Filings', 'Secretarial Audit & Board Governance', 'Trademark & IP Filing'] }
        ] 
      },
      { 
        name: 'Business & Financial Consultant', 
        parameters: [
          { name: 'Field of Practice', type: 'radio', options: ['Corporate Strategy & Growth', 'Fundraising & Pitch Deck Prep', 'Financial Planning & Wealth Management', 'Operational Optimization'] },
          { name: 'Consultation Mode', type: 'radio', options: ['Online Video Conference (Zoom/Meet)', 'In-Person Chamber Meeting', 'Client Office Visit'] }
        ] 
      },
      { 
        name: 'Architect & Interior Designer', 
        parameters: [
          { name: 'Design Services', type: 'checkbox', options: ['2D Floor Plans & Blueprints', '3D Photorealistic Interior Render', 'Full Home / Office Turnkey Renovation', 'Site Supervision & Quality Inspection'] }
        ] 
      },
      { 
        name: 'Civil & Structural Consultant', 
        parameters: [
          { name: 'Engineering Focus', type: 'checkbox', options: ['Structural Stability Audit', 'Building Construction Estimation', 'Municipal Map Approvals & Sanctions', 'Soil Testing & Foundation Design'] }
        ] 
      }
    ]
  },
  {
    id: 's-freelance',
    primaryType: 'SERVICE',
    name: 'Freelancer',
    theme: 'bg-cyan-50 text-cyan-600',
    icon: 'Laptop',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'B2B', 'Quote', 'Meeting'],
    workflow: 'Meeting / Proposal Workflow',
    allowedFeatures: ['Service', 'B2C', 'B2B', 'Quote', 'Meeting'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'MOQ', 'Bulk Pricing'],
    optionalFeatures: ['RFQ', 'Appointment'],
    subcategories: [
      { 
        name: 'IT & Web Developer', 
        parameters: [
          { name: 'Tech Stack / Skill', type: 'checkbox', options: ['Full-Stack Web (Next.js/React/Node)', 'WordPress / Shopify / WooCommerce', 'Backend APIs & Cloud Databases', 'DevOps & AWS/Cloud Setup', 'Bug Fixing & Code Audit'] },
          { name: 'Engagement Model', type: 'radio', options: ['Fixed Project Milestone', 'Hourly Consultation Call', 'Monthly Dedicated Retainer'] }
        ] 
      },
      { 
        name: 'Mobile App Developer', 
        parameters: [
          { name: 'Platform', type: 'checkbox', options: ['Cross-Platform Flutter App', 'React Native iOS & Android', 'Native Android (Kotlin)', 'Native iOS (Swift)'] },
          { name: 'Engagement Model', type: 'radio', options: ['Full App MVP Sprint', 'Feature Addition', 'App Store / Play Store Deployment'] }
        ] 
      },
      { 
        name: 'Video & Reel Editor', 
        parameters: [
          { name: 'Editing Scope', type: 'checkbox', options: ['Instagram Reels & TikTok Shorts (Vertical)', 'YouTube Long-Form Storytelling', 'Podcast Audio/Video Sync & Multicam', 'Commercials & Product Promos', 'Color Grading & Audio Mastering'] },
          { name: 'Deliverable Turnaround', type: 'radio', options: ['24-48 Hours Express', '3-5 Business Days', 'Weekly Project Cycle'] }
        ] 
      },
      { 
        name: 'Photo & Media Editor', 
        parameters: [
          { name: 'Editing Type', type: 'checkbox', options: ['E-Commerce Product Photo Retouching', 'High-End Portrait & Beauty Retouch', 'Real Estate HDR Enhancement', 'Background Removal & Composite'] }
        ] 
      },
      { 
        name: 'UI/UX & Product Designer', 
        parameters: [
          { name: 'Design Focus', type: 'checkbox', options: ['Figma Web & Landing Page Design', 'Complete Mobile App UI/UX & Prototypes', 'Design System & Component Library', 'Wireframing & User Journey Mapping'] }
        ] 
      },
      { 
        name: 'Graphic Designer & Branding', 
        parameters: [
          { name: 'Design Services', type: 'checkbox', options: ['Brand Logo & Visual Identity Guidelines', 'Social Media Creatives & Ad Banners', 'Pitch Decks & Presentations', 'Product Packaging & Print Collateral'] }
        ] 
      },
      { 
        name: 'Content Writer & Copywriter', 
        parameters: [
          { name: 'Writing Domain', type: 'checkbox', options: ['SEO Blog Posts & Thought Leadership', 'High-Converting Landing Page Copy', 'Email Marketing Funnels & Newsletters', 'Technical Documentation & Whitepapers'] }
        ] 
      },
      { 
        name: 'Digital Marketer & SEO Specialist', 
        parameters: [
          { name: 'Marketing Domain', type: 'checkbox', options: ['Google Ads PPC & Search Campaigns', 'Meta Facebook & Instagram Ads', 'On-Page, Technical & Backlink SEO', 'Social Media Organic Growth Strategy'] }
        ] 
      },
      { 
        name: 'Voiceover & Audio Engineer', 
        parameters: [
          { name: 'Audio Services', type: 'checkbox', options: ['Commercial Voiceover (Hindi / English)', 'Podcast Audio Cleanup & Mixing', 'Sound Design & Royalty-Free Foley', 'Audiobook Narration'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Automobile Repair & Servicing', 
        parameters: [
          { name: 'Vehicle Type', type: 'radio', options: ['Bike', 'Car', 'Truck', 'Bus', 'Heavy Vehicle (JCB)'] },
          { name: 'Services Offered', type: 'checkbox', options: ['Engine Oil & Filter Change', 'Brake Pad & Disc Replacement', 'Clutch & Gearbox Overhaul', 'Battery Jumpstart & Replacement', 'Suspension & Steering Repair', 'Hydraulics & Machinery Maintenance'] },
          { name: 'Service Location', type: 'radio', options: ['Garage Workshop Visit', 'Doorstep Breakdown Assistance', 'Roadside Towing & Rescue', 'On-Site Field Visit (JCB & Heavy Commercial)'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Home & Office Deep Cleaning', 
        parameters: [
          { name: 'Property Configuration', type: 'radio', options: ['1 BHK Apartment', '2 BHK Apartment', '3 BHK Apartment', 'Villa / Duplex', 'Commercial Office'] },
          { name: 'Cleaning Scope', type: 'checkbox', options: ['Kitchen Chimney & Degreasing', 'Bathroom Descaling & Sanitization', 'Sofa & Carpet Vacuum Shampoo', 'Window & Balcony Pressure Wash'] },
          { name: 'Chemicals / Equipment', type: 'radio', options: ['Eco-Friendly Pet-Safe Agents', 'Industrial Strength Cleaners', 'Mechanized Single Disc Floor Scrubbing'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Painting & Waterproofing', 
        parameters: [
          { name: 'Job Type', type: 'radio', options: ['Full Home Repainting', 'Single Room / Rental Touch-up', 'Waterproofing & Crack Repair', 'Exterior Texture & Weatherproofing'] },
          { name: 'Paint Brand Option', type: 'radio', options: ['Asian Paints Royale / Apex', 'Berger Silk / WeatherCoat', 'Dulux Velvet', 'Customer Provided Paint (Labour Only)'] },
          { name: 'Site Masking & Cleanup', type: 'radio', options: ['Floor & Furniture Masking Included', 'Basic Newspaper Masking'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Academic Tutoring & Coaching', 
        parameters: [
          { name: 'Target Level / Grade', type: 'radio', options: ['Primary (Classes 1-5)', 'Middle School (Classes 6-8)', 'Secondary (Classes 9-10)', 'Senior Secondary (Classes 11-12)', 'Competitive Exams (JEE/NEET/UPSC)'] },
          { name: 'Curriculum Board', type: 'radio', options: ['CBSE', 'ICSE', 'State Board', 'IGCSE / IB International'] },
          { name: 'Teaching Mode', type: 'radio', options: ['1-on-1 Home Tuition', 'Online Live Classes', 'Batch Coaching at Center'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Photography & Cinematography', 
        parameters: [
          { name: 'Event Type', type: 'radio', options: ['Wedding & Pre-Wedding', 'Birthday & Family Events', 'Commercial & Product Shoot', 'Fashion & Modeling Portfolio', 'Corporate Event'] },
          { name: 'Deliverables Included', type: 'checkbox', options: ['Full Raw Photos (Google Drive)', 'Edited High-Res Album (40+ Sheets)', 'Cinematic 4K Teaser Video', 'Traditional Full Video', 'Drone Aerial Footage'] }
        ] 
      }
    ]
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Event & Wedding Decor', 
        parameters: [
          { name: 'Occasion', type: 'radio', options: ['Wedding & Reception', 'Engagement / Roka', 'Haldi & Mehndi Setup', 'Corporate Conference / Gala', 'Kids Theme Birthday'] },
          { name: 'Included Services', type: 'checkbox', options: ['Stage & Floral Decoration', 'Sound & DJ Lighting Setup', 'Catering Management', 'Guest Welcome & Hospitality', 'Venue Booking Assistance'] }
        ] 
      },
      {
        name: 'Birthday & Party Planning',
        parameters: [
          { name: 'Party Type', type: 'radio', options: ['Kids Theme Birthday', 'Milestone Adult Birthday', 'Anniversary Celebration', 'Cocktail / Bachelor Party', 'Baby Shower / Gender Reveal'] },
          { name: 'Venue Arrangements', type: 'radio', options: ['Home / Backyard Setup', 'Banquet Hall / Hotel Ballroom', 'Open Lawn / Farmhouse', 'Rooftop Lounge'] },
          { name: 'Add-on Entertainment', type: 'checkbox', options: ['Live DJ & Sound System', 'Magic Show & Balloon Artist', 'Custom Photo Booth & Props', 'Tattoo & Face Painter', 'Live Acoustic Singer'] }
        ]
      },
      {
        name: 'Corporate Events & Galas',
        parameters: [
          { name: 'Event Format', type: 'radio', options: ['Annual Corporate Gala / Awards', 'Product Launch & Press Conference', 'Dealer / Partner Meet', 'Hackathon / Tech Conference', 'Team Building Retreat'] },
          { name: 'Audio-Visual & Tech', type: 'checkbox', options: ['LED Video Wall (P2/P3)', 'Live Stage Truss & Intelligent Lighting', 'Live Webcast / Hybrid Streaming', 'Multi-Mic Audio Console', 'Podium & Branding Backdrops'] },
          { name: 'Estimated Attendees', type: 'radio', options: ['Up to 50 Attendees', '50 - 200 Attendees', '200 - 500 Attendees', '500+ Attendees'] }
        ]
      }
    ]
  },
  {
    id: 's15',
    primaryType: 'SERVICE',
    name: 'Food & Dining',
    theme: 'bg-rose-50 text-rose-600',
    icon: 'Utensils',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment'],
    workflow: 'Restaurant Booking Workflow',
    allowedFeatures: ['Service', 'Appointment', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'Bulk Pricing', 'B2B', 'Token'],
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Restaurant', 
        parameters: [
          { name: 'Booking Options', type: 'checkbox', options: ['Table Booking', 'Private Dining', 'Rooftop Seating', 'Candlelight Dinner'] },
          { name: 'Cuisine Type', type: 'checkbox', options: ['North Indian', 'South Indian', 'Chinese & Pan-Asian', 'Continental / Italian', 'Mughlai & Biryani', 'Pure Veg Jain Options'] },
          { name: 'Dietary Preference', type: 'radio', options: ['Pure Vegetarian', 'Non-Vegetarian & Halal', 'Multi-Cuisine'] },
          { name: 'Restaurant Amenities', type: 'checkbox', options: ['Valet Parking', 'Free Wi-Fi', 'Live Music / DJ', 'Outdoor Smoking Zone', 'Kids High Chair Available'] }
        ] 
      },
      { 
        name: 'Cafe & Bistro', 
        parameters: [
          { name: 'Booking Options', type: 'checkbox', options: ['Table Booking', 'Co-Working Desk', 'Private Birthday / Event Space'] },
          { name: 'Cafe Specialties', type: 'checkbox', options: ['Artisan Brewed Coffee', 'Fresh Bakes & Pastries', 'Healthy Bowls & Salads', 'Shakes & Mocktails'] },
          { name: 'Work Friendly Amenities', type: 'checkbox', options: ['High Speed Wi-Fi (100+ Mbps)', 'Charging Sockets at Every Table', 'Quiet Work Environment'] }
        ] 
      },
      { 
        name: 'Food Shop & Bakery', 
        parameters: [
          { name: 'Shop Type', type: 'radio', options: ['Artisan Bakery & Cake Shop', 'Traditional Sweet Mart (Mithai)', 'Gourmet Organic Grocery', 'Ice Cream Parlour & Desserts'] },
          { name: 'Order & Packaging Mode', type: 'radio', options: ['Over-The-Counter Takeaway', 'Dine-in Tables Available', 'Express Home Delivery'] }
        ] 
      }
    ]
  },
  {
    id: 's16',
    primaryType: 'SERVICE',
    name: 'Car Wash & Automobile',
    theme: 'bg-cyan-50 text-cyan-700',
    icon: 'Car',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Token', 'Appointment', 'Quote'],
    workflow: 'Appointment Workflow',
    allowedFeatures: ['Service', 'B2C', 'Token', 'Appointment', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'B2B', 'MOQ'],
    optionalFeatures: ['Meeting'],
    subcategories: [
      {
        name: 'Car Wash & Detailing',
        parameters: [
          { name: 'Vehicle Type', type: 'radio', options: ['Bike', 'Car', 'Truck', 'Bus', 'Heavy Vehicle (JCB)'] },
          { name: 'Wash Package', type: 'checkbox', options: ['Foam Pressure Wash & Hand Dry', 'Interior Deep Vacuum & Dashboard Polish', 'Underbody & Engine Bay Wash', 'Teflon Coating & Gloss Wax', 'Ceramic Paint Shield (9H)', 'Windshield Rain Repellent Treatment'] },
          { name: 'Service Mode', type: 'radio', options: ['Drive-in Center (Live Token)', 'Doorstep Mobile Wash Van', 'Complimentary Pickup & Drop'] }
        ]
      },
      {
        name: 'Automobile Repair & Servicing',
        parameters: [
          { name: 'Vehicle Type', type: 'radio', options: ['Bike', 'Car', 'Truck', 'Bus', 'Heavy Vehicle (JCB)'] },
          { name: 'Service Scope', type: 'checkbox', options: ['Periodic Maintenance & Synthetic Oil Change', 'Brake Pad & Disc Replacement', 'Clutch Plate & Gearbox Service', 'Battery Diagnostic & Jumpstart', 'Air Conditioning Service & Filter Change', 'Suspension & Steering Overhaul', 'Hydraulics & Heavy Machinery Servicing'] },
          { name: 'Service Location', type: 'radio', options: ['Authorized Service Center Visit', 'Doorstep Breakdown Assistance', 'Roadside Towing & Rescue', 'On-Site Field Visit (JCB & Heavy Commercial)'] }
        ]
      }
    ]
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
      { 
        name: 'Car', 
        parameters: [
          { name: 'Body Type', type: 'radio', options: ['Hatchback', 'Sedan', 'Compact SUV', 'Full Size 7-Seater SUV', 'Luxury / MUV'] },
          { name: 'Fuel Type', type: 'radio', options: ['Petrol', 'Diesel', 'CNG', 'Electric (EV)', 'Strong Hybrid'] },
          { name: 'Transmission', type: 'radio', options: ['Manual', 'Automatic (AT/CVT/DCT)'] },
          { name: 'Ownership Status', type: 'radio', options: ['Brand New Car', 'Certified Pre-Owned (1st Owner)', 'Pre-Owned (2nd Owner)'] },
          { name: 'Listing Purpose', type: 'radio', options: ['Direct Sale', 'Self-Drive Rental', 'Chauffeur Driven Rental'] }
        ] 
      },
      { 
        name: 'Bike & Scooter', 
        parameters: [
          { name: 'Category', type: 'radio', options: ['Commuter Bike (100-125cc)', 'Sports / Cruiser (150-350cc)', 'Automatic Scooter', 'Electric Scooter (EV)'] },
          { name: 'Listing Purpose', type: 'radio', options: ['Direct Sale', 'Daily / Monthly Rental'] }
        ] 
      },
      { 
        name: 'Truck & Commercial', 
        parameters: [
          { name: 'Payload Capacity', type: 'radio', options: ['Under 2 Tons (Tata Ace/Bolero)', '3 to 7 Tons', '10 to 16 Tons', '25+ Tons Multi-Axle'] },
          { name: 'Body Configuration', type: 'radio', options: ['Open Body Truck', 'Container Closed Body', 'Refrigerated Cold Truck', 'Dumper / Tipper'] }
        ] 
      },
      { 
        name: 'Bus & Van', 
        parameters: [
          { name: 'Seating Capacity', type: 'radio', options: ['12-16 Seater Force Traveller', '24-32 Seater Mini Bus', '45-55 Seater Luxury Coach'] },
          { name: 'AC Comfort', type: 'radio', options: ['AC Luxury Sleeper', 'AC Pushback Seater', 'Non-AC Standard'] }
        ] 
      },
      { 
        name: 'Tractor & Farm Equipment', 
        parameters: [
          { name: 'Horsepower (HP)', type: 'radio', options: ['25-35 HP', '36-45 HP', '46-55 HP', 'Above 55 HP (4WD)'] },
          { name: 'Attachments Included', type: 'checkbox', options: ['Rotavator', 'Cultivator', 'Tipping Trolley', 'Front Loader'] }
        ] 
      },
      { 
        name: 'Construction Vehicle', 
        parameters: [
          { name: 'Heavy Equipment Type', type: 'radio', options: ['JCB / Backhoe Loader', 'Hydraulic Excavator', 'Road Roller / Compactor', 'Transit Concrete Mixer', 'Hydra Crane'] },
          { name: 'Rental Model', type: 'radio', options: ['Hourly with Operator & Fuel', 'Monthly Dry Lease', 'Outright Sale'] }
        ] 
      }
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
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
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
    // 1. Instant cache load from localStorage
    try {
      const cached = localStorage.getItem('mv_cache_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setIsLoading(false);
        }
      }
    } catch {}

    // 2. Fetch fresh products
    let url = `/products?location=${encodeURIComponent(userLocation)}`;
    if (userLat !== null && userLng !== null) {
      url += `&lat=${userLat}&lng=${userLng}`;
    }
    if (radiusFilter !== null) {
      url += `&radius=${radiusFilter}`;
    }
    
    fastFetch<any>(url, { ttlMs: 15000 })
      .then(data => {
        let rawItems: any[] = [];
        if (data && Array.isArray(data.data)) {
          rawItems = data.data;
        } else if (Array.isArray(data)) {
          rawItems = data;
        }

        if (rawItems.length > 0) {
          const mappedData = rawItems.map((item: any) => ({
            ...item,
            seller: item.sellerName,
            category: item.categoryName,
            subcategory: item.subcategory,
            primaryType: (item.type === 'SERVICE' || item.primaryType === 'SERVICE') ? 'SERVICE' : (item.primaryType || 'PRODUCT'),
            image: item.image || item.sku || undefined,
            images: item.images || (item.image ? [item.image] : []),
            isPremium: false,
            isB2B: item.isB2B,
            moq: item.moq,
            status: item.status
          }));
          setProducts(mappedData);
          try {
            localStorage.setItem('mv_cache_products', JSON.stringify(mappedData));
          } catch {}
        }
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
      })
      .finally(() => setIsLoading(false));

    // Fetch categories with instant local cache + fastFetch
    const normalizeCategoryKey = (name: string) => {
      const k = (name || '').toLowerCase().trim();
      if (k === 'freelance' || k === 'freelancer') return 'freelancer';
      return k;
    };

    const mergeWithDefaults = (fetched: Category[]): Category[] => {
      const mergedMap = new Map<string, Category>();
      // 1. Put all defaultCategories first
      defaultCategories.forEach(c => {
        const key = normalizeCategoryKey(c.name);
        mergedMap.set(key, { ...c, name: key === 'freelancer' ? 'Freelancer' : c.name });
      });
      // 2. Overlay server data
      fetched.forEach(c => {
        const key = normalizeCategoryKey(c.name);
        const canonicalName = key === 'freelancer' ? 'Freelancer' : c.name;
        const existing = mergedMap.get(key);
        if (existing) {
          mergedMap.set(key, {
            ...existing,
            ...c,
            name: canonicalName,
            // If server has empty or fewer subcategories, keep the richer subcategories
            subcategories: (c.subcategories && c.subcategories.length >= (existing.subcategories?.length || 0))
              ? c.subcategories
              : existing.subcategories
          });
        } else {
          mergedMap.set(key, { ...c, name: canonicalName });
        }
      });
      return Array.from(mergedMap.values());
    };

    try {
      const cachedCat = localStorage.getItem('mv_cache_categories');
      if (cachedCat) {
        const parsedCat = JSON.parse(cachedCat);
        if (Array.isArray(parsedCat) && parsedCat.length > 0) {
          setCategories(mergeWithDefaults(parsedCat));
        }
      }
    } catch {}

    fastFetch<any[]>(`${API_URL}/categories`, { ttlMs: 60000 })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = mergeWithDefaults(data);
          setCategories(merged);
          try {
            localStorage.setItem('mv_cache_categories', JSON.stringify(merged));
          } catch {}
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
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.message || errJson?.error || `Failed to add product (HTTP ${res.status})`;
        console.error('Server error adding product:', errMsg, errJson);
        throw new Error(errMsg);
      }
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
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.message || errJson?.error || `Failed to edit product (HTTP ${res.status})`;
        console.error('Server error editing product:', errMsg, errJson);
        throw new Error(errMsg);
      }
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
  if (context === undefined) {
    return {
      products: [],
      allProducts: [],
      categories: [],
      allCategories: [],
      isLoading: true,
      userLocation: 'Detecting Location...',
      userLat: null,
      userLng: null,
      setUserLat: () => {},
      setUserLng: () => {},
      radiusFilter: null,
      setRadiusFilter: () => {},
      setUserLocation: () => {},
      detectLocation: async () => {},
      filterProducts: () => [],
      getProductById: () => undefined,
      addProduct: async () => {},
      editProduct: async () => {},
      updateProduct: async () => {},
      deleteProduct: async () => {},
      addCategory: async () => {},
      updateCategory: async () => {},
      deleteCategory: async () => {},
    };
  }
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
