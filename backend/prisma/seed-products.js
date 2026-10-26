import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DUMMY_PASSWORD = 'Demo@12345';

const PRODUCTS_DATA = [
  {
    segmentKey: 'electronics',
    categoryName: 'Electronics',
    subcategory: 'Mobile',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'MonitorSmartphone',
    email: 'electronics.dummy@markatverse.com',
    phone: '9820011001',
    sellerName: 'Apex Tech Digital World',
    markatId: 'MK-PRD-ELEC',
    productName: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 512GB)',
    description: 'Flagship AI smartphone with 200MP Quad Telephoto Camera, Snapdragon 8 Gen 3 Processor, Built-in S-Pen, and Gorilla Glass Armor display.',
    price: 119999,
    originalPrice: 134999,
    discount: '11% OFF',
    rating: '4.9',
    reviews: '1.4K',
    badge: 'Flagship AI',
    badgeColor: 'badge-purple',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'RAM': ['8 GB', '12 GB'],
      'Storage': ['256 GB', '512 GB', '1 TB'],
      'Color': ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Amber'],
      'Warranty': '1 Year Manufacturer Onsite Warranty'
    },
    options: [
      { id: 'opt-elec-1', name: '12GB RAM + 256GB Storage', price: 109999, discountPercentage: 12 },
      { id: 'opt-elec-2', name: '12GB RAM + 512GB Storage (Bestseller)', price: 119999, discountPercentage: 11 },
      { id: 'opt-elec-3', name: '12GB RAM + 1TB Extreme Storage', price: 139999, discountPercentage: 10 }
    ],
    isB2B: false,
    stock: 45
  },
  {
    segmentKey: 'laptop',
    categoryName: 'Electronics',
    subcategory: 'Laptop',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'Laptop',
    email: 'laptops.dummy@markatverse.com',
    phone: '9820011002',
    sellerName: 'Silicon Pro Compute Hub',
    markatId: 'MK-PRD-LAPTOP',
    productName: 'Apple MacBook Pro 16" M3 Pro (18GB Unified Memory, 512GB SSD)',
    description: 'Blazing-fast M3 Pro chip with 12-core CPU, 18-core GPU, Liquid Retina XDR display, up to 22 hours of battery life, and studio-quality mics.',
    price: 199900,
    originalPrice: 249900,
    discount: '20% OFF',
    rating: '5.0',
    reviews: '890',
    badge: 'Pro Creator',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Processor / CPU': ['Apple M-Series'],
      'RAM Capacity': ['18 GB Unified/DDR5', '36 GB Unified/DDR5'],
      'Storage SSD': ['512 GB NVMe SSD', '1 TB NVMe SSD'],
      'Screen Size': ['16" - 17.3" Creator/Gaming'],
      'Operating System': ['macOS'],
      'Color': ['Space Black', 'Silver']
    },
    options: [
      { id: 'opt-mb-1', name: '18GB Unified Memory + 512GB SSD', price: 199900, discountPercentage: 20 },
      { id: 'opt-mb-2', name: '36GB Unified Memory + 1TB SSD', price: 249900, discountPercentage: 15 }
    ],
    isB2B: false,
    stock: 20
  },
  {
    segmentKey: 'fashion',
    categoryName: 'Fashion',
    subcategory: 'Men Clothing',
    theme: 'bg-violet-50 text-violet-600',
    icon: 'Shirt',
    email: 'fashion.dummy@markatverse.com',
    phone: '9820011003',
    sellerName: 'Vogue & Style Luxury Apparel',
    markatId: 'MK-PRD-FASH',
    productName: 'Premium Italian Cut Linen Suit Blazer & Trouser Set',
    description: 'Tailored from 100% breathable organic European flax linen. Unstructured soft shoulder tailoring for warm-weather elegance and wedding celebrations.',
    price: 3499,
    originalPrice: 6999,
    discount: '50% OFF',
    rating: '4.8',
    reviews: '412',
    badge: 'Italian Fit',
    badgeColor: 'badge-purple',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Available Sizes': ['S', 'M', 'L', 'XL', 'XXL'],
      'Fabric Material': 'Linen',
      'Fit Type': 'Slim Fit',
      'Color': ['Navy Blue', 'Beige', 'Olive Green', 'Classic Black']
    },
    options: [
      { id: 'opt-fsh-1', name: 'Blazer Only (Single Piece)', price: 2499, discountPercentage: 50 },
      { id: 'opt-fsh-2', name: 'Complete 2-Piece Suit (Blazer + Trousers)', price: 3499, discountPercentage: 50 }
    ],
    isB2B: false,
    stock: 120
  },
  {
    segmentKey: 'homekitchen',
    categoryName: 'Home & Kitchen',
    subcategory: 'Furniture & Decor',
    theme: 'bg-orange-50 text-orange-600',
    icon: 'Home',
    email: 'homekitchen.dummy@markatverse.com',
    phone: '9820011004',
    sellerName: 'HomeStyle Luxury Living & Furniture',
    markatId: 'MK-PRD-HOME',
    productName: 'Solid Sheesham Wood 6-Seater Dining Table Set',
    description: 'Crafted from authentic seasoned Indian Rosewood with warm honey teak lacquer finish. Includes 6 ergonomic cushioned chairs with stain-resistant fabric.',
    price: 24999,
    originalPrice: 38000,
    discount: '34% OFF',
    rating: '4.9',
    reviews: '235',
    badge: 'Solid Wood',
    badgeColor: 'badge-amber',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Wood / Material Type': 'Solid Sheesham Wood',
      'Assembly': 'Pre-assembled',
      'Color': ['Honey Teak', 'Dark Walnut', 'Natural Oak']
    },
    options: [
      { id: 'opt-hm-1', name: '4-Seater Compact Dining Set', price: 18999, discountPercentage: 35 },
      { id: 'opt-hm-2', name: '6-Seater Family Dining Set (Table + 6 Chairs)', price: 24999, discountPercentage: 34 }
    ],
    isB2B: false,
    stock: 18
  },
  {
    segmentKey: 'construction',
    categoryName: 'Construction',
    subcategory: 'Cement',
    theme: 'bg-amber-50 text-amber-600',
    icon: 'HardHat',
    email: 'construction.dummy@markatverse.com',
    phone: '9820011005',
    sellerName: 'National Infra & Building Supplies',
    markatId: 'MK-PRD-CONST',
    productName: 'UltraTech Super Premium Portland Cement (50kg Bag) - Bulk Wholesale',
    description: 'High performance 53 Grade Ordinary Portland Cement (OPC) for multi-story casting, RCC columns, bridges, and industrial foundation infrastructure.',
    price: 380,
    originalPrice: 440,
    discount: '14% OFF',
    rating: '4.8',
    reviews: '3.1K',
    badge: 'Verified B2B',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Grade': '53 Grade',
      'Packaging Type': '50 Kg Bag',
      'Brand / ISI Standard': 'UltraTech ISI Certified'
    },
    isB2B: true,
    moq: 50,
    wholesaleTiers: [
      { minQty: 50, margin: 15 },
      { minQty: 200, margin: 25 },
      { minQty: 500, margin: 35 }
    ],
    stock: 5000
  },
  {
    segmentKey: 'industrial',
    categoryName: 'Industrial Machinery & Tools',
    subcategory: 'Power Tools & Workshop Equipment',
    theme: 'bg-zinc-100 text-zinc-800',
    icon: 'Cpu',
    email: 'industrial.dummy@markatverse.com',
    phone: '9820011006',
    sellerName: 'HeavyDuty Power Tools & Machinery Corp',
    markatId: 'MK-PRD-IND',
    productName: 'Bosch Professional 26mm Heavy-Duty Rotary Hammer Drill (850W)',
    description: 'Industrial concrete impact drilling and chiseling machine with safety clutch, variable speed control, vibration damping, and robust aluminum gear casing.',
    price: 6899,
    originalPrice: 9500,
    discount: '27% OFF',
    rating: '4.9',
    reviews: '520',
    badge: 'Industrial Grade',
    badgeColor: 'badge-slate',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Tool Category': 'Rotary Hammer Drill',
      'Power Rating (Watts)': '900W - 1400W',
      'Power Source': '220V Corded Electric',
      'Warranty': '1 Year Heavy Industry Guarantee'
    },
    isB2B: true,
    moq: 5,
    wholesaleTiers: [
      { minQty: 5, margin: 15 },
      { minQty: 20, margin: 25 }
    ],
    stock: 80
  },
  {
    segmentKey: 'grocery',
    categoryName: 'Grocery & FMCG',
    subcategory: 'Edible Oils & Ghee',
    theme: 'bg-emerald-50 text-emerald-600',
    icon: 'ShoppingBag',
    email: 'grocery.dummy@markatverse.com',
    phone: '9820011007',
    sellerName: 'NatureFresh Organic Farm Grocers',
    markatId: 'MK-PRD-GROC',
    productName: 'Pure Cold-Pressed Kachi Ghani Mustard & Sesame Oil (5L Can)',
    description: 'Traditionally stone-pressed from first-grade black mustard seeds. Unrefined, unbleached, zero chemical solvents, and naturally rich in Omega-3 fatty acids.',
    price: 999,
    originalPrice: 1350,
    discount: '26% OFF',
    rating: '4.9',
    reviews: '1.8K',
    badge: 'Cold Pressed',
    badgeColor: 'badge-emerald',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Oil Type': 'Cold Pressed Mustard',
      'Volume': ['1 Litre Bottle', '5 Litre Can'],
      'Dietary Preference': '100% Organic'
    },
    options: [
      { id: 'opt-gro-1', name: '1 Litre Glass Bottle', price: 249, discountPercentage: 20 },
      { id: 'opt-gro-2', name: '5 Litre Family Economy Can', price: 999, discountPercentage: 26 }
    ],
    isB2B: false,
    stock: 250
  },
  {
    segmentKey: 'healthcare',
    categoryName: 'Healthcare & Medical Devices',
    subcategory: 'Medical Equipment & Monitors',
    theme: 'bg-teal-50 text-teal-600',
    icon: 'ShieldPlus',
    email: 'healthcare.dummy@markatverse.com',
    phone: '9820011008',
    sellerName: 'MediCare Diagnostics & Health Devices',
    markatId: 'MK-PRD-HLTH',
    productName: 'Omron Smart Digital Blood Pressure Monitor with Bluetooth App',
    description: 'Clinically validated upper-arm digital BP monitor with Intellisense technology, irregular heartbeat detection, dual-user memory, and smartphone sync.',
    price: 2499,
    originalPrice: 3800,
    discount: '34% OFF',
    rating: '4.9',
    reviews: '2.4K',
    badge: 'Clinical Grade',
    badgeColor: 'badge-teal',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Device Type': 'Digital BP Monitor',
      'Power Source': 'Dual Battery / AC',
      'Certifications': ['FDA Approved', 'CE Certified', 'CDSCO Registered'],
      'Warranty Period': '3 Years Manufacturer Warranty'
    },
    options: [
      { id: 'opt-med-1', name: 'BP Monitor with Standard Cuff (22-32 cm)', price: 2499, discountPercentage: 34 },
      { id: 'opt-med-2', name: 'BP Monitor with Wide Range Comfit Cuff + AC Adapter', price: 3199, discountPercentage: 25 }
    ],
    isB2B: false,
    stock: 65
  },
  {
    segmentKey: 'autoparts',
    categoryName: 'Automotive Parts & Accessories',
    subcategory: 'Car Electronics & Interior',
    theme: 'bg-slate-100 text-slate-800',
    icon: 'Wrench',
    email: 'autoparts.dummy@markatverse.com',
    phone: '9820011009',
    sellerName: 'Apex Motors Spares & Car Electronics',
    markatId: 'MK-PRD-AUTO',
    productName: 'Qubo 4K Ultra HD Dual Channel Front & Rear Car Dashcam',
    description: 'Sony STARVIS sensor for ultra-crisp night vision, 140° wide angle lens, built-in GPS logger, 24-hour parking monitoring, and emergency G-sensor lock.',
    price: 8999,
    originalPrice: 14999,
    discount: '40% OFF',
    rating: '4.8',
    reviews: '670',
    badge: '4K Night Vision',
    badgeColor: 'badge-blue',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Accessory': 'Dashcam Dual Channel',
      'Operating Voltage': '12V Car Socket',
      'Warranty Period': '1 Year Onsite Replacement Guarantee'
    },
    options: [
      { id: 'opt-ap-1', name: 'Front 4K Dashcam Only', price: 6499, discountPercentage: 40 },
      { id: 'opt-ap-2', name: 'Dual Channel Front 4K + Rear 1080p + 64GB Card', price: 8999, discountPercentage: 40 }
    ],
    isB2B: false,
    stock: 40
  },
  {
    segmentKey: 'beauty',
    categoryName: 'Beauty, Cosmetics & Personal Care',
    subcategory: 'Skincare & Face Care',
    theme: 'bg-rose-50 text-rose-600',
    icon: 'Sparkles',
    email: 'beauty.dummy@markatverse.com',
    phone: '9820011010',
    sellerName: 'GlowAura Botanical Skincare & Cosmetics',
    markatId: 'MK-PRD-BEAUTY',
    productName: '15% Vitamin C + Hyaluronic Acid Radiance Face Serum (50ml)',
    description: 'Potent antioxidant serum formulated with Ethyl Ascorbic Acid, Ferulic Acid, and botanicals for glowing skin, dark spot reduction, and deep hydration.',
    price: 599,
    originalPrice: 1199,
    discount: '50% OFF',
    rating: '4.8',
    reviews: '3.2K',
    badge: 'Derm Approved',
    badgeColor: 'badge-pink',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Category': 'Face Serum (Vitamin C/Hyaluronic)',
      'Skin Type': 'All Skin Types',
      'Formulation Traits': ['Dermatologically Tested', 'Cruelty Free & Vegan', 'Paraben & Sulphate Free']
    },
    options: [
      { id: 'opt-bt-1', name: '30ml Travel Glass Dropper Bottle', price: 449, discountPercentage: 45 },
      { id: 'opt-bt-2', name: '50ml Value Pack Glass Dropper', price: 599, discountPercentage: 50 }
    ],
    isB2B: false,
    stock: 300
  },
  {
    segmentKey: 'sports',
    categoryName: 'Sports, Fitness & Outdoor',
    subcategory: 'Gym & Fitness Gear',
    theme: 'bg-emerald-50 text-emerald-700',
    icon: 'Activity',
    email: 'fitness.dummy@markatverse.com',
    phone: '9820011011',
    sellerName: 'IronGrip Fitness & Sports Equipment',
    markatId: 'MK-PRD-FIT',
    productName: 'Heavy-Duty Hexagonal Rubber Dumbbells Set (5kg to 20kg Pairs with Rack)',
    description: 'Commercial anti-roll cast iron dumbbells coated with high-density virgin rubber, chrome-plated knurled ergonomic handles, and a 2-tier steel vertical rack.',
    price: 7499,
    originalPrice: 12000,
    discount: '37% OFF',
    rating: '4.9',
    reviews: '410',
    badge: 'Pro Fitness',
    badgeColor: 'badge-emerald',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Equipment Category': 'Dumbbells & Barbells (Rubber/Hex)',
      'Weight / Spec': 'Pair of 5kg, 7.5kg, 10kg with Stand',
      'Material': 'Cast Iron with Heavy Rubber Coating'
    },
    options: [
      { id: 'opt-sp-1', name: 'Pair of 5kg Hex Dumbbells', price: 1499, discountPercentage: 30 },
      { id: 'opt-sp-2', name: 'Pair of 10kg Hex Dumbbells', price: 2799, discountPercentage: 35 },
      { id: 'opt-sp-3', name: 'Complete 5kg + 7.5kg + 10kg Pairs with Steel Stand', price: 7499, discountPercentage: 37 }
    ],
    isB2B: false,
    stock: 35
  },
  {
    segmentKey: 'agriculture',
    categoryName: 'Agriculture',
    subcategory: 'Seeds',
    theme: 'bg-lime-50 text-lime-600',
    icon: 'Leaf',
    email: 'agriculture.dummy@markatverse.com',
    phone: '9820011012',
    sellerName: 'KisanSeva Agro Tech & Hybrid Seeds',
    markatId: 'MK-PRD-AGRO',
    productName: 'Certified High-Yield Hybrid Wheat & Vegetable Seeds Kit (40kg Bag)',
    description: 'ICAR and NSC certified disease-resistant hybrid seeds with 98% germination rate. Formulated with protective bio-fungicide coating for maximum crop yield.',
    price: 1850,
    originalPrice: 2500,
    discount: '26% OFF',
    rating: '4.8',
    reviews: '920',
    badge: 'Govt Certified',
    badgeColor: 'badge-green',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Crop Type': 'Cereals & Grains',
      'Seed Treatment': 'Hybrid Certified',
      'Germination Rate': '98% Guaranteed'
    },
    isB2B: true,
    moq: 10,
    wholesaleTiers: [
      { minQty: 10, margin: 15 },
      { minQty: 50, margin: 25 }
    ],
    stock: 1200
  },
  {
    segmentKey: 'stationery',
    categoryName: 'Books, Stationery & Office Supplies',
    subcategory: 'Office Stationery & Paper Products',
    theme: 'bg-amber-50 text-amber-800',
    icon: 'BookOpen',
    email: 'stationery.dummy@markatverse.com',
    phone: '9820011013',
    sellerName: 'Oxford Books & Corporate Stationery',
    markatId: 'MK-PRD-STAT',
    productName: 'JK Copier Premium 75 GSM A4 Paper (Carton of 5 Reams / 2500 Sheets)',
    description: 'High brightness 98% jam-free copy paper optimized for high-speed laser printing, xerox photocopying, and color inkjet office presentations.',
    price: 1299,
    originalPrice: 1800,
    discount: '28% OFF',
    rating: '4.9',
    reviews: '3.5K',
    badge: 'Bulk Value',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Item Type': 'A4 Copy Paper (70/75/80 GSM)',
      'Pack Quantity': 'Carton of 5 Reams',
      'Brightness': '98% Ultra White'
    },
    options: [
      { id: 'opt-st-1', name: 'Single Ream (500 Sheets)', price: 299, discountPercentage: 20 },
      { id: 'opt-st-2', name: 'Master Box Carton (5 Reams / 2500 Sheets)', price: 1299, discountPercentage: 28 }
    ],
    isB2B: false,
    stock: 600
  },
  {
    segmentKey: 'babycare',
    categoryName: 'Baby Care & Toys',
    subcategory: 'Educational Toys & Games',
    theme: 'bg-sky-50 text-sky-600',
    icon: 'Baby',
    email: 'babycare.dummy@markatverse.com',
    phone: '9820011014',
    sellerName: 'TinySteps Baby Essentials & STEM Toys',
    markatId: 'MK-PRD-BABY',
    productName: 'Educational STEM Robotics & Building Blocks Kit (800+ Pieces with Motor)',
    description: 'BIS-certified non-toxic ABS construction kit with electric motor, gears, and wireless remote control. Promotes spatial thinking, engineering, and motor skills.',
    price: 1999,
    originalPrice: 3499,
    discount: '43% OFF',
    rating: '4.8',
    reviews: '620',
    badge: 'STEM Certified',
    badgeColor: 'badge-sky',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Toy Type': 'Building Blocks & LEGO',
      'Recommended Age': '6-8 Years',
      'Safety Standards': ['BIS Certified (ISI Mark)', 'Non-Toxic BPA Free Plastic', 'Smooth Rounded Edges']
    },
    options: [
      { id: 'opt-toy-1', name: 'Starter Kit (400 Pieces)', price: 1299, discountPercentage: 40 },
      { id: 'opt-toy-2', name: 'Deluxe Motorized Edition (800+ Pieces with Remote)', price: 1999, discountPercentage: 43 }
    ],
    isB2B: false,
    stock: 90
  }
];

async function main() {
  console.log('🚀 Starting creation of dummy seller accounts and product listings for all segments...');
  const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);

  for (const p of PRODUCTS_DATA) {
    console.log(`\n🔹 Processing ${p.categoryName} (${p.sellerName})...`);

    // 1. Ensure Category exists
    let category = await prisma.category.findFirst({
      where: { name: p.categoryName }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: p.categoryName,
          primaryType: 'PRODUCT',
          theme: p.theme,
          icon: p.icon,
          allowedListingTypes: ['Product'],
          businessModels: p.isB2B ? ['B2B', 'B2C', 'Bulk Pricing', 'MOQ'] : ['B2C', 'B2B'],
          allowedFeatures: p.isB2B ? ['Product Stock', 'B2B', 'B2C', 'Bulk Pricing', 'MOQ'] : ['Product Stock', 'B2C', 'B2B']
        }
      });
      console.log(`   Created category: ${category.name}`);
    }

    // 2. Upsert Seller User
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {
        name: p.sellerName,
        phone: p.phone,
        password: hashedPassword,
        role: 'SELLER'
      },
      create: {
        email: p.email,
        phone: p.phone,
        password: hashedPassword,
        name: p.sellerName,
        role: 'SELLER',
        markatId: p.markatId
      }
    });
    console.log(`   User account ready: ${user.email} (Role: ${user.role})`);

    // 3. Upsert Business profile
    const bCode = 'BIZ-PRD-' + p.segmentKey.toUpperCase();
    await prisma.business.upsert({
      where: { userId: user.id },
      update: {
        name: p.sellerName,
        businessCode: bCode,
        businessModel: p.isB2B ? 'B2B' : 'B2C',
        businessType: p.isB2B ? 'MANUFACTURER' : 'RETAILER',
        sector: p.categoryName,
        address: 'Connaught Place Commercial Hub',
        pincode: '110001',
        latitude: 28.6315,
        longitude: 77.2167,
        verified: true,
        verificationStatus: 'APPROVED',
        verificationLevel: 2,
        capabilities: p.isB2B ? ['B2B', 'B2C', 'BULK'] : ['B2C', 'RETAIL']
      },
      create: {
        userId: user.id,
        businessCode: bCode,
        name: p.sellerName,
        businessModel: p.isB2B ? 'B2B' : 'B2C',
        businessType: p.isB2B ? 'MANUFACTURER' : 'RETAILER',
        sector: p.categoryName,
        address: 'Connaught Place Commercial Hub',
        pincode: '110001',
        latitude: 28.6315,
        longitude: 77.2167,
        verified: true,
        verificationStatus: 'APPROVED',
        verificationLevel: 2,
        capabilities: p.isB2B ? ['B2B', 'B2C', 'BULK'] : ['B2C', 'RETAIL']
      }
    });

    // 4. Upsert Product Listing
    const existingListing = await prisma.product.findFirst({
      where: {
        sellerId: user.id,
        categoryName: p.categoryName
      }
    });

    const productPayload = {
      name: p.productName,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      rating: p.rating,
      reviews: p.reviews,
      sellerName: p.sellerName,
      location: 'Connaught Place, New Delhi 110001',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
      categoryName: p.categoryName,
      subcategory: p.subcategory,
      type: 'PRODUCT',
      badge: p.badge,
      badgeColor: p.badgeColor,
      image: p.image,
      images: p.images,
      parameters: p.parameters,
      options: p.options || [],
      isB2B: p.isB2B || false,
      moq: p.moq || 1,
      stock: p.stock || 100,
      status: 'ACTIVE'
    };

    if (existingListing) {
      await prisma.product.update({
        where: { id: existingListing.id },
        data: productPayload
      });
      console.log(`   Product updated: "${p.productName}" (ID: ${existingListing.id})`);
    } else {
      const created = await prisma.product.create({
        data: {
          ...productPayload,
          sellerId: user.id,
          categoryId: category.id
        }
      });
      console.log(`   Product created: "${p.productName}" (ID: ${created.id})`);
    }
  }

  console.log('\n✅ Successfully created dummy accounts and product listings for all segments!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dummy products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
