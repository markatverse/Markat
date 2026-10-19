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
      { name: 'Snacks & Packaged Food', parameters: [{ name: 'Food Preference', type: 'radio', options: ['Vegetarian (Green Dot)', 'Non-Vegetarian'] }, { name: 'Shelf Life', type: 'radio', options: ['1-3 Months', '6 Months', '12 Months'] }] }
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
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Hair Salon', 
        parameters: [
          { name: 'Target Audience', type: 'radio', options: ['Men Only', 'Women Only', 'Unisex'] },
          { name: 'Service Location', type: 'radio', options: ['In-Salon Only', 'At-Home Service Available', 'Both Salon & Home'] },
          { name: 'Salon Amenities', type: 'checkbox', options: ['Air Conditioned', 'Free Wi-Fi', 'Complimentary Beverages', 'Parking Available'] }
        ] 
      },
      { 
        name: 'Beauty Parlour', 
        parameters: [
          { name: 'Service Category', type: 'radio', options: ['Facial & Skincare', 'Waxing & Threading', 'Bridal & Party Makeup', 'Manicure & Pedicure'] },
          { name: 'Products Used', type: 'radio', options: ['Premium Herbal / Organic', 'International Brands (L\'Oreal, MAC, Cheryl\'s)', 'Standard Salon Grade'] }
        ] 
      },
      { 
        name: 'Nail Art Studio', 
        parameters: [
          { name: 'Technique', type: 'checkbox', options: ['Gel Extensions', 'Acrylic Extensions', 'Nail Art & Ombre', 'Cuticle Care & Polish'] }
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
    optionalFeatures: ['RFQ', 'Appointment'],
    subcategories: [
      { 
        name: 'Business & Legal Advisory', 
        parameters: [
          { name: 'Field of Practice', type: 'radio', options: ['Company Registration & GST/Tax', 'Corporate & Contract Law', 'Intellectual Property (Trademark/Patent)', 'Financial Planning & Wealth Management', 'IT / Software Architecture Strategy'] },
          { name: 'Consultation Mode', type: 'radio', options: ['Online Video Conference (Zoom/Meet)', 'In-Person Chamber Meeting', 'Client Office Visit'] },
          { name: 'Deliverable', type: 'checkbox', options: ['Written Opinion / Legal Notice', 'Filing & Compliance Submission', '1-on-1 Recorded Consultation Call'] }
        ] 
      }
    ]
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
    optionalFeatures: ['RFQ', 'Appointment'],
    subcategories: [
      { 
        name: 'Digital & Creative Services', 
        parameters: [
          { name: 'Expertise Skill', type: 'radio', options: ['Web & Mobile App Development', 'UI/UX Design (Figma)', 'Digital Marketing & SEO/Ads', 'Content Writing & Copywriting', 'Video Editing & Animation'] },
          { name: 'Revision Policy', type: 'radio', options: ['2 Rounds Included', 'Unlimited Minor Revisions', 'Pay-per-revision'] },
          { name: 'Turnaround Time', type: 'radio', options: ['24-48 Hours Express', '3-5 Business Days', '1-2 Weeks Project'] }
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
          { name: 'Vehicle Type', type: 'radio', options: ['Two Wheeler (Bike/Scooter)', 'Four Wheeler (Hatchback/Sedan)', 'SUV & Luxury Car', 'Commercial Light Vehicle'] },
          { name: 'Services Offered', type: 'checkbox', options: ['Engine Oil & Filter Change', 'Brake Pad & Disc Replacement', 'Clutch & Gearbox Overhaul', 'Battery Jumpstart & Replacement', 'Suspension & Steering Repair'] },
          { name: 'Service Location', type: 'radio', options: ['Garage Workshop Visit', 'Doorstep Breakdown Assistance', 'Both Workshop & Doorstep'] }
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
    try {
      const cachedCat = localStorage.getItem('mv_cache_categories');
      if (cachedCat) {
        const parsedCat = JSON.parse(cachedCat);
        if (Array.isArray(parsedCat) && parsedCat.length > 0) {
          setCategories(parsedCat);
        }
      }
    } catch {}

    fastFetch<any[]>(`${API_URL}/categories`, { ttlMs: 60000 })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          try {
            localStorage.setItem('mv_cache_categories', JSON.stringify(data));
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
  if (context === undefined) {
    return {
      products: [],
      categories: [],
      isLoading: false,
      userLocation: 'Detecting Location...',
      userLat: null,
      userLng: null,
      radiusFilter: null,
      setRadiusFilter: () => {},
      setUserLocation: () => {},
      detectLocation: async () => {},
      filterProducts: () => [],
      getProductById: () => undefined,
      addProduct: async () => {},
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
