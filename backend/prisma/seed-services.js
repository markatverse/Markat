import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DUMMY_PASSWORD = 'Demo@12345';

const SERVICES_DATA = [
  {
    categoryKey: 'salon',
    categoryName: 'Salon & Parlour',
    subcategory: 'Salon',
    primaryType: 'SERVICE',
    theme: 'bg-pink-50 text-pink-600',
    icon: 'Scissors',
    email: 'salon.dummy@markatverse.com',
    phone: '9810011001',
    sellerName: 'Luxe Unisex Salon & Hair Studio',
    markatId: 'MK-SRV-SALON',
    serviceTitle: 'Luxe Unisex Hair Cutting, Styling & Keratin Spa',
    description: 'Premier styling salon offering customized haircuts, beard styling, organic facials, and luxury keratin hair spa with live queue token tracking.',
    price: 299,
    originalPrice: 599,
    discount: '50% OFF',
    rating: '4.9',
    reviews: '342',
    badge: 'Popular Salon',
    badgeColor: 'badge-pink',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Target Audience': 'Unisex',
      'Service Location': 'In-Salon Only',
      'Salon Amenities': ['Air Conditioned', 'Free Wi-Fi', 'Complimentary Beverages', 'Parking Available'],
      'bookingModel': 'HYBRID'
    },
    options: [
      { id: 'opt-sl-1', name: 'Signature Haircut & Beard Styling', price: 299, discountPercentage: 50 },
      { id: 'opt-sl-2', name: 'L’Oréal Hair Spa & Scalp Massage', price: 899, discountPercentage: 35 },
      { id: 'opt-sl-3', name: 'Brazilian Keratin Smoothing Therapy', price: 2499, discountPercentage: 40 }
    ],
    hasQueue: true,
    queue: {
      currentToken: 7,
      lastToken: 12,
      avgMinutes: 20,
      pricePerHour: 299
    }
  },
  {
    categoryKey: 'spa',
    categoryName: 'Spa',
    subcategory: 'Ayurvedic & Body Spa',
    primaryType: 'SERVICE',
    theme: 'bg-rose-50 text-rose-500',
    icon: 'Droplet',
    email: 'spa.dummy@markatverse.com',
    phone: '9810011002',
    sellerName: 'Aura Ayurvedic & Wellness Spa',
    markatId: 'MK-SRV-SPA',
    serviceTitle: 'Full Body Swedish & Ayurvedic Relaxation Therapy',
    description: 'Indulge in holistic herbal massages, Swedish deep tissue therapies, steam baths, and foot reflexology administered by certified therapists.',
    price: 1499,
    originalPrice: 2499,
    discount: '40% OFF',
    rating: '4.8',
    reviews: '215',
    badge: 'Holistic Spa',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Therapy Type': 'Swedish Deep Tissue',
      'Session Duration': '60 Minutes',
      'Facilities Available': ['Steam Bath', 'Sauna Room', 'Jacuzzi', 'Shower En-suite'],
      'bookingModel': 'APPOINTMENT'
    },
    options: [
      { id: 'opt-sp-1', name: 'Swedish Deep Tissue Massage (60 Mins)', price: 1499, discountPercentage: 40 },
      { id: 'opt-sp-2', name: 'Ayurvedic Panchakarma Therapy (90 Mins)', price: 2199, discountPercentage: 35 },
      { id: 'opt-sp-3', name: 'Herbal Foot Reflexology (45 Mins)', price: 799, discountPercentage: 30 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'doctor',
    categoryName: 'Doctor',
    subcategory: 'Clinic & OPD Consultation',
    primaryType: 'SERVICE',
    theme: 'bg-emerald-50 text-emerald-600',
    icon: 'Stethoscope',
    email: 'doctor.dummy@markatverse.com',
    phone: '9810011003',
    sellerName: 'Dr. Sharma Healthcare Polyclinic',
    markatId: 'MK-SRV-DOC',
    serviceTitle: 'General Physician & Family Health Consultation',
    description: 'Comprehensive OPD consultation for fever, diabetes, hypertension, lifestyle disorders, and routine preventive health checkups with live queue tokens.',
    price: 400,
    originalPrice: 600,
    discount: '33% OFF',
    rating: '4.9',
    reviews: '520',
    badge: 'Verified Clinic',
    badgeColor: 'badge-emerald',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Specialization Field': 'General Physician',
      'Consultation Mode': 'Both In-Clinic & Online',
      'Emergency Support': 'During Clinic Hours Only',
      'bookingModel': 'HYBRID'
    },
    options: [
      { id: 'opt-doc-1', name: 'In-Clinic OPD Consultation', price: 400, discountPercentage: 33 },
      { id: 'opt-doc-2', name: 'Online Tele-Consultation (Video Call)', price: 499, discountPercentage: 20 },
      { id: 'opt-doc-3', name: 'Comprehensive Executive Health Checkup', price: 1499, discountPercentage: 40 }
    ],
    hasQueue: true,
    queue: {
      currentToken: 4,
      lastToken: 10,
      avgMinutes: 15,
      pricePerHour: 400
    }
  },
  {
    categoryKey: 'plumber',
    categoryName: 'Plumber',
    subcategory: 'Plumbing Repair & Installation',
    primaryType: 'SERVICE',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'Wrench',
    email: 'plumber.dummy@markatverse.com',
    phone: '9810011004',
    sellerName: 'SpeedyFlow Plumbing Solutions',
    markatId: 'MK-SRV-PLUMB',
    serviceTitle: 'Emergency Pipe Leakage & Sanitary Fitting Works',
    description: 'Expert residential and commercial plumbing repairs, tap leaks, toilet flush installations, geyser connection, and underground drain block removals.',
    price: 199,
    originalPrice: 399,
    discount: '50% OFF',
    rating: '4.8',
    reviews: '189',
    badge: 'Fast Response',
    badgeColor: 'badge-blue',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Service Scope': ['Tap & Shower Leakage Fix', 'Toilet Flush & Commode Installation', 'Pipe Blockage Removal'],
      'Warranty On Repair': '30 Days Service Warranty',
      'Urgent Emergency Visit': 'Available within 60 Mins',
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-pl-1', name: 'Tap & Shower Leak Repair Visit', price: 199, discountPercentage: 50 },
      { id: 'opt-pl-2', name: 'Commode & Western Toilet Setup', price: 599, discountPercentage: 35 },
      { id: 'opt-pl-3', name: 'Drainage Pipe Blockage Machine Cleaning', price: 899, discountPercentage: 40 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'electrician',
    categoryName: 'Electrician',
    subcategory: 'Electrical Repairs & Wiring',
    primaryType: 'SERVICE',
    theme: 'bg-yellow-50 text-yellow-600',
    icon: 'Zap',
    email: 'electrician.dummy@markatverse.com',
    phone: '9810011005',
    sellerName: 'VoltCare Certified Electrical Works',
    markatId: 'MK-SRV-ELEC',
    serviceTitle: 'House Wiring, MCB Tripping & Inverter Setup',
    description: 'Licensed wiremen for switchboard replacements, short-circuit troubleshooting, fancy light & chandelier installation, and inverter battery setups.',
    price: 249,
    originalPrice: 499,
    discount: '50% OFF',
    rating: '4.9',
    reviews: '276',
    badge: 'Certified Wireman',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Services Offered': ['Fan / Chandelier Installation', 'Switchboard Repair & MCB Tripping Fix', 'Inverter / Battery Setup'],
      'Electrician Certification': 'Licensed / Govt Wireman Certified',
      'Safety Measures': ['Insulated VDE Tested Tools', 'Rubber Safety Boots', 'Voltage Tester Check'],
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-el-1', name: 'Switchboard & MCB Tripping Check', price: 249, discountPercentage: 50 },
      { id: 'opt-el-2', name: 'Ceiling Fan & Heavy Chandelier Mounting', price: 349, discountPercentage: 30 },
      { id: 'opt-el-3', name: 'Inverter + Double Battery Setup & Wiring', price: 799, discountPercentage: 40 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'carpenter',
    categoryName: 'Carpenter',
    subcategory: 'Carpentry & Woodwork',
    primaryType: 'SERVICE',
    theme: 'bg-amber-50 text-amber-700',
    icon: 'Hammer',
    email: 'carpenter.dummy@markatverse.com',
    phone: '9810011006',
    sellerName: 'WoodCraft Modular Carpentry',
    markatId: 'MK-SRV-CARP',
    serviceTitle: 'Custom Furniture Repair & Modular Kitchen Cabinetry',
    description: 'Skilled woodwork craftsmanship for door lock fixing, custom wardrobes, modular kitchen adjustments, sofa frame repairs, and wood polish.',
    price: 299,
    originalPrice: 599,
    discount: '50% OFF',
    rating: '4.7',
    reviews: '143',
    badge: 'Wood Craftsman',
    badgeColor: 'badge-amber',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Scope of Work': ['Door Lock & Handle Fitting', 'Furniture Repair & Polish', 'Modular Kitchen Cabinetry'],
      'Billing Basis': 'Fixed Scope Quote',
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-cr-1', name: 'Door Lock, Latch & Hydraulic Hinge Fitting', price: 299, discountPercentage: 50 },
      { id: 'opt-cr-2', name: 'Bed / Sofa Wooden Framework Restoration', price: 699, discountPercentage: 35 },
      { id: 'opt-cr-3', name: 'Modular Kitchen Cabinet Alignment & Rollers', price: 999, discountPercentage: 40 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'professional-lawyer',
    categoryName: 'Professional',
    subcategory: 'Lawyer',
    primaryType: 'SERVICE',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'Scale',
    email: 'lawyer.dummy@markatverse.com',
    phone: '9810011007',
    sellerName: 'Adv. Rajesh Malhotra & Legal Chamber',
    markatId: 'MK-SRV-LAW',
    serviceTitle: 'Advocate Legal Advisory - Property & Civil Law',
    description: 'Senior High Court advocate chamber providing legal consultation on property disputes, title verification, consumer litigation, and corporate agreements.',
    price: 999,
    originalPrice: 1500,
    discount: '33% OFF',
    rating: '4.9',
    reviews: '98',
    badge: 'Senior Advocate',
    badgeColor: 'badge-indigo',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Legal Domain': 'Civil & Property Dispute',
      'Consultation Mode': 'In-Chamber Office Meeting',
      'Court Jurisdiction': 'High Court & District Sessions',
      'bookingModel': 'MEETING'
    },
    options: [
      { id: 'opt-lw-1', name: '30-Minute In-Chamber Advisory Session', price: 999, discountPercentage: 33 },
      { id: 'opt-lw-2', name: 'Property Title Verification & Legal Opinion', price: 2499, discountPercentage: 25 },
      { id: 'opt-lw-3', name: 'Formal Legal Notice Drafting & Dispatch', price: 3499, discountPercentage: 30 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'professional-ca',
    categoryName: 'Professional',
    subcategory: 'Chartered Accountant (CA)',
    primaryType: 'SERVICE',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'Briefcase',
    email: 'ca.dummy@markatverse.com',
    phone: '9810011008',
    sellerName: 'Singhania & Co. Chartered Accountants',
    markatId: 'MK-SRV-CA',
    serviceTitle: 'Income Tax ITR Filing, GST Return & Audit',
    description: 'Expert Chartered Accountants for personal and corporate income tax returns, monthly GST filings, company incorporation, and ROC compliances.',
    price: 799,
    originalPrice: 1200,
    discount: '33% OFF',
    rating: '4.9',
    reviews: '312',
    badge: 'Practicing CA',
    badgeColor: 'badge-emerald',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'CA Specialization': ['ITR Income Tax Filing', 'GST Return Filing & Notice', 'Company / LLP Incorporation'],
      'Consultation Mode': 'Online Video Call (Zoom/Meet)',
      'bookingModel': 'MEETING'
    },
    options: [
      { id: 'opt-ca-1', name: 'Salaried Individual ITR Filing (Form 1/2)', price: 799, discountPercentage: 33 },
      { id: 'opt-ca-2', name: 'Business ITR & Balance Sheet Preparation', price: 2499, discountPercentage: 25 },
      { id: 'opt-ca-3', name: 'Private Limited Company Incorporation Package', price: 5999, discountPercentage: 35 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'freelancer-dev',
    categoryName: 'Freelancer',
    subcategory: 'IT & Web Developer',
    primaryType: 'SERVICE',
    theme: 'bg-cyan-50 text-cyan-600',
    icon: 'Laptop',
    email: 'freelancer.dummy@markatverse.com',
    phone: '9810011009',
    sellerName: 'NextGen Web & Full-Stack Solutions',
    markatId: 'MK-SRV-DEV',
    serviceTitle: 'Custom Next.js, React & E-Commerce Web Development',
    description: 'Full-stack software engineering for high-conversion web apps, REST APIs, cloud databases, bug fixing, and modern responsive design sprints.',
    price: 1999,
    originalPrice: 3500,
    discount: '43% OFF',
    rating: '5.0',
    reviews: '84',
    badge: 'Top Rated Pro',
    badgeColor: 'badge-cyan',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Tech Stack / Skill': ['Full-Stack Web (Next.js/React/Node)', 'Backend APIs & Cloud Databases', 'Bug Fixing & Code Audit'],
      'Engagement Model': 'Fixed Project Milestone',
      'bookingModel': 'PROPOSAL'
    },
    options: [
      { id: 'opt-dev-1', name: 'Bug Fix & Speed Optimization Sprint', price: 1999, discountPercentage: 43 },
      { id: 'opt-dev-2', name: 'Landing Page MVP Design & Next.js Code', price: 6999, discountPercentage: 30 },
      { id: 'opt-dev-3', name: 'Full Stack Web Platform (Frontend + Backend + DB)', price: 24999, discountPercentage: 25 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'freelancer-video',
    categoryName: 'Freelancer',
    subcategory: 'Video & Reel Editor',
    primaryType: 'SERVICE',
    theme: 'bg-cyan-50 text-cyan-600',
    icon: 'Film',
    email: 'videoeditor.dummy@markatverse.com',
    phone: '9810011010',
    sellerName: 'CineCuts Creative Video Studio',
    markatId: 'MK-SRV-VIDEO',
    serviceTitle: 'Viral Instagram Reels & 4K YouTube Video Editing',
    description: 'Professional visual storytelling, dynamic captions, color grading, sound design, and pacing optimized for maximum social media retention.',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    rating: '4.9',
    reviews: '175',
    badge: 'Trending Editor',
    badgeColor: 'badge-purple',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Editing Scope': ['Instagram Reels & TikTok Shorts (Vertical)', 'YouTube Long-Form Storytelling', 'Color Grading & Audio Mastering'],
      'Deliverable Turnaround': '24-48 Hours Express',
      'bookingModel': 'PROPOSAL'
    },
    options: [
      { id: 'opt-vd-1', name: 'High-Retention 30-60s Reel with Animated Captions', price: 499, discountPercentage: 50 },
      { id: 'opt-vd-2', name: 'YouTube Long-Form Video (8-12 Mins)', price: 1899, discountPercentage: 35 },
      { id: 'opt-vd-3', name: 'Monthly Creator Growth Pack (15 Reels)', price: 6999, discountPercentage: 40 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'mechanic',
    categoryName: 'Mechanic',
    subcategory: 'Automobile Repair & Servicing',
    primaryType: 'SERVICE',
    theme: 'bg-slate-100 text-slate-700',
    icon: 'Car',
    email: 'mechanic.dummy@markatverse.com',
    phone: '9810011011',
    sellerName: 'AutoMech Doorstep Car & Bike Garage',
    markatId: 'MK-SRV-MECH',
    serviceTitle: 'Doorstep Automobile Repair & Breakdown Assistance',
    description: 'Expert mechanics for periodic synthetic oil changes, brake pads, battery jumpstarts, clutch tuning, and 24x7 roadside towing assistance.',
    price: 499,
    originalPrice: 899,
    discount: '44% OFF',
    rating: '4.8',
    reviews: '198',
    badge: 'Mobile Garage',
    badgeColor: 'badge-slate',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Vehicle Type': 'Car',
      'Services Offered': ['Engine Oil & Filter Change', 'Brake Pad & Disc Replacement', 'Battery Jumpstart & Replacement'],
      'Service Location': 'Doorstep Breakdown Assistance',
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-mc-1', name: 'Two-Wheeler Comprehensive General Service', price: 499, discountPercentage: 44 },
      { id: 'opt-mc-2', name: 'Car Periodic Service (Engine Oil + 21 Points Check)', price: 1499, discountPercentage: 35 },
      { id: 'opt-mc-3', name: '24x7 Emergency Breakdown & Battery Jumpstart', price: 399, discountPercentage: 20 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'cleaner',
    categoryName: 'Cleaner',
    subcategory: 'Home & Office Deep Cleaning',
    primaryType: 'SERVICE',
    theme: 'bg-teal-50 text-teal-600',
    icon: 'Sparkles',
    email: 'cleaner.dummy@markatverse.com',
    phone: '9810011012',
    sellerName: 'SparkleClean Deep Cleaning Services',
    markatId: 'MK-SRV-CLN',
    serviceTitle: 'Complete Home, Sofa & Kitchen Sanitization Deep Cleaning',
    description: 'Mechanized single-disc floor scrubbing, kitchen chimney degreasing, bathroom descaling, and upholstery shampooing with eco-friendly chemicals.',
    price: 999,
    originalPrice: 1800,
    discount: '45% OFF',
    rating: '4.8',
    reviews: '280',
    badge: 'Deep Sanitized',
    badgeColor: 'badge-teal',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Property Configuration': '2 BHK Apartment',
      'Cleaning Scope': ['Kitchen Chimney & Degreasing', 'Bathroom Descaling & Sanitization', 'Sofa & Carpet Vacuum Shampoo'],
      'Chemicals / Equipment': 'Eco-Friendly Pet-Safe Agents',
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-cl-1', name: 'Sofa & Carpet Deep Vacuum Shampooing', price: 799, discountPercentage: 35 },
      { id: 'opt-cl-2', name: 'Kitchen & Bathroom Heavy Descaling Combo', price: 1199, discountPercentage: 40 },
      { id: 'opt-cl-3', name: 'Complete 2-BHK Apartment Move-in Deep Cleaning', price: 2499, discountPercentage: 45 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'painter',
    categoryName: 'Painter',
    subcategory: 'Painting & Waterproofing',
    primaryType: 'SERVICE',
    theme: 'bg-purple-50 text-purple-600',
    icon: 'Brush',
    email: 'painter.dummy@markatverse.com',
    phone: '9810011013',
    sellerName: 'ColorVibe Home Painting & Waterproofing',
    markatId: 'MK-SRV-PNT',
    serviceTitle: 'Interior & Exterior Wall Painting & Damp Waterproofing',
    description: 'Laser measurement, dust-free sanding machines, furniture masking, crack sealing, and premium Asian Paints Royale finishes with 1-year warranty.',
    price: 1499,
    originalPrice: 2500,
    discount: '40% OFF',
    rating: '4.7',
    reviews: '112',
    badge: 'Dust-Free Painting',
    badgeColor: 'badge-purple',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Job Type': 'Full Home Repainting',
      'Paint Brand Option': 'Asian Paints Royale / Apex',
      'Site Masking & Cleanup': 'Floor & Furniture Masking Included',
      'bookingModel': 'RFQ'
    },
    options: [
      { id: 'opt-pt-1', name: 'Single Room Rental Touchup Painting', price: 1499, discountPercentage: 40 },
      { id: 'opt-pt-2', name: 'Wall Dampness Seepage & Waterproofing Repair', price: 3499, discountPercentage: 30 },
      { id: 'opt-pt-3', name: 'Complete 2-BHK Asian Paints Royale Painting', price: 11999, discountPercentage: 35 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'tutor',
    categoryName: 'Tutor',
    subcategory: 'Academic Tutoring & Coaching',
    primaryType: 'SERVICE',
    theme: 'bg-indigo-50 text-indigo-600',
    icon: 'BookOpen',
    email: 'tutor.dummy@markatverse.com',
    phone: '9810011014',
    sellerName: 'Apex Scholars Private Academy',
    markatId: 'MK-SRV-TUTR',
    serviceTitle: '1-on-1 Class 9-12 CBSE Maths & Physics Coaching',
    description: 'Experienced master tutors providing concept clarity, weekly test series, doubt solving sessions, and targeted preparation for board exams & JEE.',
    price: 0,
    originalPrice: 500,
    discount: 'Free Trial',
    rating: '4.9',
    reviews: '154',
    badge: 'Top Educator',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Target Level / Grade': 'Secondary (Classes 9-10)',
      'Curriculum Board': 'CBSE',
      'Teaching Mode': '1-on-1 Home Tuition',
      'bookingModel': 'APPOINTMENT'
    },
    options: [
      { id: 'opt-tt-1', name: 'Complimentary 30-Minute Trial & Diagnostic Test', price: 0, discountPercentage: 100 },
      { id: 'opt-tt-2', name: 'Monthly 1-on-1 Home Tutoring (12 Sessions)', price: 3999, discountPercentage: 20 },
      { id: 'opt-tt-3', name: 'Board Exam Comprehensive Crash Course Batch', price: 5999, discountPercentage: 30 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'photographer',
    categoryName: 'Photographer',
    subcategory: 'Photography & Cinematography',
    primaryType: 'SERVICE',
    theme: 'bg-neutral-50 text-neutral-800',
    icon: 'Camera',
    email: 'photographer.dummy@markatverse.com',
    phone: '9810011015',
    sellerName: 'Golden Lens Wedding & Cinematic Studio',
    markatId: 'MK-SRV-PHOTO',
    serviceTitle: 'Cinematic Wedding, Pre-Wedding & Event Photography',
    description: 'Award-winning cinematographers with Sony FX3 cameras, drone aerial coverage, candid portraiture, and handcrafted premium photo albums.',
    price: 3999,
    originalPrice: 6000,
    discount: '33% OFF',
    rating: '4.9',
    reviews: '230',
    badge: 'Award Winning',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Event Type': 'Wedding & Pre-Wedding',
      'Deliverables Included': ['Full Raw Photos (Google Drive)', 'Edited High-Res Album (40+ Sheets)', 'Cinematic 4K Teaser Video', 'Drone Aerial Footage'],
      'bookingModel': 'APPOINTMENT'
    },
    options: [
      { id: 'opt-ph-1', name: '2-Hour Birthday / Portfolio Shoot with Edited Photos', price: 3999, discountPercentage: 33 },
      { id: 'opt-ph-2', name: 'Cinematic Pre-Wedding Shoot with Drone & 4K Teaser', price: 14999, discountPercentage: 25 },
      { id: 'opt-ph-3', name: 'Full 2-Day Wedding Cinematography & Luxury Album', price: 39999, discountPercentage: 30 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'eventplanner',
    categoryName: 'Event Planner',
    subcategory: 'Birthday & Party Planning',
    primaryType: 'SERVICE',
    theme: 'bg-fuchsia-50 text-fuchsia-600',
    icon: 'Calendar',
    email: 'eventplanner.dummy@markatverse.com',
    phone: '9810011016',
    sellerName: 'Celebrations Gala & Wedding Event Planners',
    markatId: 'MK-SRV-EVENT',
    serviceTitle: 'Turnkey Wedding Decor, Live DJ & Party Planning',
    description: 'Full-service event management for luxury theme weddings, balloon styling, birthday parties, DJ sound systems, catering, and venue coordination.',
    price: 4999,
    originalPrice: 8000,
    discount: '38% OFF',
    rating: '4.9',
    reviews: '318',
    badge: 'Elite Decorator',
    badgeColor: 'badge-pink',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Party Type': 'Kids Theme Birthday',
      'Venue Arrangements': 'Home / Backyard Setup',
      'Add-on Entertainment': ['Live DJ & Sound System', 'Magic Show & Balloon Artist', 'Custom Photo Booth & Props'],
      'bookingModel': 'APPOINTMENT'
    },
    options: [
      { id: 'opt-ev-1', name: 'Kids Theme Birthday Backdrop & Balloon Arch', price: 4999, discountPercentage: 38 },
      { id: 'opt-ev-2', name: 'Haldi & Mehndi Floral Decor + Sound System', price: 18999, discountPercentage: 30 },
      { id: 'opt-ev-3', name: 'Grand Turnkey Wedding Stage & Entrance Production', price: 65000, discountPercentage: 25 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'restaurant',
    categoryName: 'Food & Dining',
    subcategory: 'Restaurant',
    primaryType: 'SERVICE',
    theme: 'bg-rose-50 text-rose-600',
    icon: 'Utensils',
    email: 'restaurant.dummy@markatverse.com',
    phone: '9810011017',
    sellerName: 'The Royal Heritage Bistro & Rooftop Dining',
    markatId: 'MK-SRV-REST',
    serviceTitle: 'Fine Dining Table Reservation & Private Candlelight Dinner',
    description: 'Exquisite multi-cuisine fine dining featuring North Indian, Continental & Pan-Asian delicacies, live acoustic music, rooftop views, and private dining cabins.',
    price: 200,
    originalPrice: 500,
    discount: '60% OFF',
    rating: '4.9',
    reviews: '890',
    badge: 'Michelin Grade',
    badgeColor: 'badge-gold',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Booking Options': ['Table Booking', 'Private Dining', 'Rooftop Seating', 'Candlelight Dinner'],
      'Cuisine Type': ['North Indian', 'Continental / Italian', 'Pan-Asian'],
      'Dietary Preference': 'Multi-Cuisine',
      'Restaurant Amenities': ['Valet Parking', 'Free Wi-Fi', 'Live Music / DJ'],
      'bookingModel': 'APPOINTMENT'
    },
    options: [
      { id: 'opt-rst-1', name: 'Standard Table Reservation (2-4 Guests)', price: 200, discountPercentage: 60 },
      { id: 'opt-rst-2', name: 'Romantic Candlelight Dinner for Couples (4-Course Meal)', price: 1999, discountPercentage: 35 },
      { id: 'opt-rst-3', name: 'Private VIP Luxury Cabin (Up to 8 Guests)', price: 4499, discountPercentage: 30 }
    ],
    hasQueue: false
  },
  {
    categoryKey: 'carwash',
    categoryName: 'Car Wash & Automobile',
    subcategory: 'Car Wash & Detailing',
    primaryType: 'SERVICE',
    theme: 'bg-cyan-50 text-cyan-700',
    icon: 'Car',
    email: 'carwash.dummy@markatverse.com',
    phone: '9810011018',
    sellerName: 'SpeedShine 360 Foam Car Wash & Detailing',
    markatId: 'MK-SRV-WASH',
    serviceTitle: 'Automated Foam Car Wash & 9H Ceramic Paint Shield',
    description: 'High-pressure snow foam wash, underbody chassis spray, interior vacuum sanitization, dashboard conditioning, and 9H ceramic paint protection.',
    price: 399,
    originalPrice: 699,
    discount: '43% OFF',
    rating: '4.9',
    reviews: '412',
    badge: '360 Auto Spa',
    badgeColor: 'badge-cyan',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80'
    ],
    parameters: {
      'Vehicle Type': 'Car',
      'Wash Package': ['Foam Pressure Wash & Hand Dry', 'Interior Deep Vacuum & Dashboard Polish', 'Underbody & Engine Bay Wash', 'Teflon Coating & Gloss Wax'],
      'Service Mode': 'Drive-in Center (Live Token)',
      'bookingModel': 'TOKEN'
    },
    options: [
      { id: 'opt-cw-1', name: 'Express Snow Foam Wash & Dry (Bike / Car)', price: 399, discountPercentage: 43 },
      { id: 'opt-cw-2', name: 'Full Deep Detailing (Foam + Interior Vacuum + Teflon)', price: 999, discountPercentage: 35 },
      { id: 'opt-cw-3', name: '9H Ceramic Paint Coating Shield (3-Year Warranty)', price: 4999, discountPercentage: 40 }
    ],
    hasQueue: true,
    queue: {
      currentToken: 3,
      lastToken: 8,
      avgMinutes: 25,
      pricePerHour: 399
    }
  }
];

async function main() {
  console.log('🚀 Starting creation of dummy service accounts and listings...');
  const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);

  for (const s of SERVICES_DATA) {
    console.log(`\n🔹 Processing ${s.categoryName} (${s.sellerName})...`);

    // 1. Ensure Category exists
    let category = await prisma.category.findFirst({
      where: { name: s.categoryName }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: s.categoryName,
          primaryType: 'SERVICE',
          theme: s.theme,
          icon: s.icon,
          allowedListingTypes: ['Service'],
          businessModels: ['B2C', 'Appointment', 'Token', 'RFQ'],
          allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C']
        }
      });
      console.log(`   Created category: ${category.name}`);
    }

    // 2. Upsert Seller User
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.sellerName,
        phone: s.phone,
        password: hashedPassword,
        role: 'SELLER'
      },
      create: {
        email: s.email,
        phone: s.phone,
        password: hashedPassword,
        name: s.sellerName,
        role: 'SELLER',
        markatId: s.markatId
      }
    });
    console.log(`   User account ready: ${user.email} (Role: ${user.role})`);

    // 3. Upsert Business profile
    const bCode = 'BIZ-' + s.markatId.replace('MK-SRV-', '');
    await prisma.business.upsert({
      where: { userId: user.id },
      update: {
        name: s.sellerName,
        businessCode: bCode,
        businessModel: 'SERVICE',
        businessType: 'SERVICE_PROVIDER',
        sector: s.categoryName,
        address: 'Connaught Place, Central Market',
        pincode: '110001',
        latitude: 28.6315,
        longitude: 77.2167,
        verified: true,
        verificationStatus: 'APPROVED',
        verificationLevel: 2,
        capabilities: ['SERVICE', 'B2C', 'APPOINTMENT']
      },
      create: {
        userId: user.id,
        businessCode: bCode,
        name: s.sellerName,
        businessModel: 'SERVICE',
        businessType: 'SERVICE_PROVIDER',
        sector: s.categoryName,
        address: 'Connaught Place, Central Market',
        pincode: '110001',
        latitude: 28.6315,
        longitude: 77.2167,
        verified: true,
        verificationStatus: 'APPROVED',
        verificationLevel: 2,
        capabilities: ['SERVICE', 'B2C', 'APPOINTMENT']
      }
    });

    // 4. Upsert Queue if applicable
    if (s.hasQueue && s.queue) {
      const existingQueue = await prisma.serviceQueue.findFirst({
        where: { sellerId: user.id }
      });

      if (existingQueue) {
        await prisma.serviceQueue.update({
          where: { id: existingQueue.id },
          data: {
            shopName: s.sellerName,
            location: 'Connaught Place, New Delhi',
            pincode: '110001',
            latitude: 28.6315,
            longitude: 77.2167,
            currentToken: s.queue.currentToken,
            lastToken: s.queue.lastToken,
            avgMinutes: s.queue.avgMinutes,
            pricePerHour: s.queue.pricePerHour,
            isOpen: true,
            status: 'ACTIVE'
          }
        });
      } else {
        await prisma.serviceQueue.create({
          data: {
            sellerId: user.id,
            shopName: s.sellerName,
            location: 'Connaught Place, New Delhi',
            pincode: '110001',
            latitude: 28.6315,
            longitude: 77.2167,
            currentToken: s.queue.currentToken,
            lastToken: s.queue.lastToken,
            avgMinutes: s.queue.avgMinutes,
            pricePerHour: s.queue.pricePerHour,
            isOpen: true,
            status: 'ACTIVE',
            enableTokens: true,
            enableAppointments: true
          }
        });
      }
      console.log(`   Live Queue created (Current Token: #${s.queue.currentToken})`);
    }

    // 5. Upsert Product / Service Listing
    const existingListing = await prisma.product.findFirst({
      where: {
        sellerId: user.id,
        categoryName: s.categoryName
      }
    });

    const listingData = {
      name: s.serviceTitle,
      description: s.description,
      price: s.price,
      originalPrice: s.originalPrice,
      discount: s.discount,
      rating: s.rating,
      reviews: s.reviews,
      sellerName: s.sellerName,
      location: 'Connaught Place, New Delhi 110001',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
      categoryName: s.categoryName,
      subcategory: s.subcategory,
      type: 'SERVICE',
      badge: s.badge,
      badgeColor: s.badgeColor,
      image: s.image,
      images: s.images,
      parameters: s.parameters,
      options: s.options,
      status: 'ACTIVE',
      stock: 999
    };

    if (existingListing) {
      await prisma.product.update({
        where: { id: existingListing.id },
        data: listingData
      });
      console.log(`   Listing updated: "${s.serviceTitle}" (ID: ${existingListing.id})`);
    } else {
      const created = await prisma.product.create({
        data: {
          ...listingData,
          sellerId: user.id,
          categoryId: category.id
        }
      });
      console.log(`   Listing created: "${s.serviceTitle}" (ID: ${created.id})`);
    }
  }

  console.log('\n✅ Successfully created dummy accounts and service listings for all platform services!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dummy services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
