import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
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
      { name: 'Mobile', nestedSubcategories: [
        { name: 'Smartphone', parameters: [
          { name: 'RAM', type: 'radio', options: ['4 GB', '6 GB', '8 GB', '12 GB'] },
          { name: 'Storage', type: 'radio', options: ['64 GB', '128 GB', '256 GB', '512 GB'] },
          { name: 'Color', type: 'checkbox', options: ['Black', 'White', 'Blue', 'Green'] },
          { name: 'Warranty', type: 'text', placeholder: 'e.g. 1 Year Manufacturer Warranty' }
        ]},
        { name: 'Feature Phone', parameters: [
          { name: 'Color', type: 'checkbox', options: ['Black', 'Blue', 'Red'] },
          { name: 'Battery', type: 'radio', options: ['1000 mAh', '2000 mAh', '3000 mAh'] }
        ]}
      ]},
      { name: 'Laptop' },
      { name: 'TV' },
      { name: 'Camera' }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  // ── SERVICE ──
  {
    id: 's1',
    primaryType: 'SERVICE',
    name: 'Beauty',
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
        name: 'Spa', 
        parameters: [
          { name: 'Therapy Type', type: 'radio', options: ['Ayurvedic Panchakarma', 'Swedish Deep Tissue', 'Aromatherapy Relaxation', 'Thai Yoga Massage'] },
          { name: 'Session Duration', type: 'radio', options: ['45 Minutes', '60 Minutes', '90 Minutes', '120 Minutes'] }
        ] 
      },
      { 
        name: 'Beauty Parlour', 
        parameters: [
          { name: 'Service Category', type: 'radio', options: ['Facial & Skincare', 'Waxing & Threading', 'Bridal & Party Makeup', 'Manicure & Pedicure'] },
          { name: 'Products Used', type: 'radio', options: ['Premium Herbal / Organic', 'International Brands (L\'Oreal, MAC, Cheryl\'s)', 'Standard Salon Grade'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  {
    id: 's2',
    primaryType: 'SERVICE',
    name: 'Healthcare',
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
        name: 'Doctor', 
        parameters: [
          { name: 'Specialization Field', type: 'radio', options: ['General Physician', 'Cardiologist', 'Pediatrician (Child Specialist)', 'Dermatologist (Skin)', 'Orthopedic (Bone & Joint)', 'Gynecologist', 'ENT Specialist'] },
          { name: 'Consultation Mode', type: 'radio', options: ['In-Clinic Consultation', 'Online Video Consultation', 'Both In-Clinic & Online'] },
          { name: 'Emergency Support', type: 'radio', options: ['Available 24x7', 'During Clinic Hours Only'] }
        ] 
      },
      { 
        name: 'Dentist', 
        parameters: [
          { name: 'Treatment Categories', type: 'checkbox', options: ['Routine Scaling & Polishing', 'Cavity Fillings', 'Root Canal Treatment (RCT)', 'Braces & Aligners', 'Teeth Whitening', 'Tooth Extraction'] },
          { name: 'Diagnostic Equipment', type: 'checkbox', options: ['Digital RVG X-Ray On-site', 'Intra-Oral Camera', 'Rotary Endodontics'] }
        ] 
      },
      { 
        name: 'Physiotherapy', 
        parameters: [
          { name: 'Service Type', type: 'radio', options: ['Clinic Sessions', 'Home Visit Physiotherapy', 'Both Clinic & Home'] },
          { name: 'Therapy Modalities', type: 'checkbox', options: ['IFT / TENS Electrotherapy', 'Ultrasound Therapy', 'Traction Bed', 'Dry Needling & Cupping'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  {
    id: 's3',
    primaryType: 'SERVICE',
    name: 'Home',
    theme: 'bg-teal-50 text-teal-600',
    icon: 'Wrench',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'RFQ', 'Quote'],
    workflow: 'Home Services Workflow',
    allowedFeatures: ['Service', 'B2C', 'RFQ', 'Quote'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'Token', 'B2B', 'MOQ'],
    optionalFeatures: ['Appointment', 'Meeting'],
    subcategories: [
      { 
        name: 'Electrician', 
        parameters: [
          { name: 'Services Offered', type: 'checkbox', options: ['Fan / Chandelier Installation', 'Switchboard Repair & MCB Tripping Fix', 'Complete House Concealed Wiring', 'Inverter / Battery Setup', 'Appliance Power Wiring (AC, Geyser)'] },
          { name: 'Electrician Certification', type: 'radio', options: ['Licensed / Govt Wireman Certified', 'Experienced Technician'] }
        ] 
      },
      { 
        name: 'Plumber', 
        parameters: [
          { name: 'Service Scope', type: 'checkbox', options: ['Tap & Shower Leakage Fix', 'Toilet Flush & Commode Installation', 'Water Tank Cleaning & Overflow Alarm', 'Pipe Blockage Removal', 'Geyser Inlet / Outlet Fitting'] },
          { name: 'Warranty On Repair', type: 'radio', options: ['30 Days Service Warranty', 'No Warranty (Labour Only)'] }
        ] 
      },
      { 
        name: 'Carpenter', 
        parameters: [
          { name: 'Scope of Work', type: 'checkbox', options: ['Door Lock & Handle Fitting', 'Furniture Repair & Polish', 'Modular Kitchen Cabinetry', 'Wardrobe & Drawer Fixing', 'Custom Bed & Sofa Frame Crafting'] },
          { name: 'Billing Basis', type: 'radio', options: ['Hourly Labour Rate', 'Fixed Scope Quote', 'Per Square Foot (Custom Furniture)'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  {
    id: 's4',
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
        name: 'Consultant', 
        parameters: [
          { name: 'Field of Practice', type: 'radio', options: ['Company Registration & GST/Tax', 'Corporate & Contract Law', 'Intellectual Property (Trademark/Patent)', 'Financial Planning & Wealth Management', 'IT / Software Architecture Strategy'] },
          { name: 'Consultation Mode', type: 'radio', options: ['Online Video Conference (Zoom/Meet)', 'In-Person Chamber Meeting', 'Client Office Visit'] }
        ] 
      },
      { 
        name: 'Lawyer', 
        parameters: [
          { name: 'Legal Domain', type: 'radio', options: ['Civil & Property Dispute', 'Criminal Law', 'Corporate / Trademark', 'Family / Matrimonial'] },
          { name: 'Court Jurisdiction', type: 'text', placeholder: 'e.g. High Court, District Sessions Court' }
        ] 
      },
      { 
        name: 'Accountant', 
        parameters: [
          { name: 'Accounting Service', type: 'checkbox', options: ['ITR Income Tax Filing', 'GST Return Filing', 'Audited Balance Sheet (P&L)', 'Payroll Management'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  {
    id: 's5',
    primaryType: 'SERVICE',
    name: 'Car Wash',
    theme: 'bg-blue-50 text-blue-600',
    icon: 'Droplet',
    allowedListingTypes: ['Service'],
    businessModels: ['B2C', 'Appointment', 'Token'],
    workflow: 'Queue Workflow',
    allowedFeatures: ['Service', 'Appointment', 'Token', 'B2C'],
    notApplicable: ['Product Stock', 'Vehicle Test Drive', 'RFQ', 'B2B'],
    optionalFeatures: ['Meeting'],
    subcategories: [
      { 
        name: 'Car Washing Center', 
        parameters: [
          { name: 'Vehicle Type', type: 'radio', options: ['Two Wheeler (Bike)', 'Hatchback', 'Sedan', 'SUV / 7-Seater', 'Commercial Tempo / Bus'] },
          { name: 'Wash Package Included', type: 'checkbox', options: ['High Pressure Foam Wash', 'Interior Vacuum & Dashboard Polish', 'Underbody Chassis Wash', 'Tire Dressing & Rim Polish', 'Engine Bay Cleaning'] },
          { name: 'Water & Chemical Standard', type: 'radio', options: ['RO Soft Water & pH-Neutral Shampoo', 'Standard Water Foam Wash'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  },
  // ── FOOD & DINING ──
  {
    id: 's6',
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
        name: 'Cafe', 
        parameters: [
          { name: 'Booking Options', type: 'checkbox', options: ['Table Booking', 'Co-Working Desk', 'Event Space'] },
          { name: 'Cafe Specialties', type: 'checkbox', options: ['Artisan Brewed Coffee', 'Fresh Bakes & Pastries', 'Healthy Bowls & Salads', 'Shakes & Mocktails'] },
          { name: 'Work Friendly Amenities', type: 'checkbox', options: ['High Speed Wi-Fi (100+ Mbps)', 'Charging Sockets at Every Table', 'Quiet Work Environment'] }
        ] 
      },
      { 
        name: 'Food Shop', 
        parameters: [
          { name: 'Type', type: 'radio', options: ['Artisan Bakery & Cake Shop', 'Traditional Sweet Mart (Mithai)', 'Gourmet Organic Grocery', 'Ice Cream Parlour & Desserts'] },
          { name: 'Order & Packaging Mode', type: 'radio', options: ['Over-The-Counter Takeaway', 'Dine-in Tables Available', 'Express Home Delivery'] }
        ] 
      }
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
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
        name: 'Bike', 
        parameters: [
          { name: 'Category', type: 'radio', options: ['Commuter Bike (100-125cc)', 'Sports / Cruiser (150-350cc)', 'Automatic Scooter', 'Electric Scooter (EV)'] },
          { name: 'Listing Purpose', type: 'radio', options: ['Direct Sale', 'Daily / Monthly Rental'] }
        ] 
      },
      { 
        name: 'Truck', 
        parameters: [
          { name: 'Payload Capacity', type: 'radio', options: ['Under 2 Tons (Tata Ace/Bolero)', '3 to 7 Tons', '10 to 16 Tons', '25+ Tons Multi-Axle'] },
          { name: 'Body Configuration', type: 'radio', options: ['Open Body Truck', 'Container Closed Body', 'Refrigerated Cold Truck', 'Dumper / Tipper'] }
        ] 
      },
      { 
        name: 'Bus', 
        parameters: [
          { name: 'Seating Capacity', type: 'radio', options: ['12-16 Seater Force Traveller', '24-32 Seater Mini Bus', '45-55 Seater Luxury Coach'] },
          { name: 'AC Comfort', type: 'radio', options: ['AC Luxury Sleeper', 'AC Pushback Seater', 'Non-AC Standard'] }
        ] 
      },
      { 
        name: 'Tractor', 
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
    ],
    parameters: [],
    defaultCommissionRate: 5.0,
    defaultFlatRate: 999.0,
  }
];

async function main() {
  console.log('Seeding categories...');
  
  for (const cat of categories) {
    const { id, ...data } = cat;
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data });
      console.log(`↻ Updated: ${cat.primaryType} - ${cat.name}`);
    } else {
      await prisma.category.create({ data });
      console.log(`✓ Created: ${cat.primaryType} - ${cat.name}`);
    }
  }

  const count = await prisma.category.count();
  console.log(`\nDone! Total categories in DB: ${count}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
