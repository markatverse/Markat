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
      { name: 'Cement', parameters: [{ name: 'Grade', type: 'radio', options: ['43 Grade', '53 Grade', 'PPC'] }] },
      { name: 'Steel', parameters: [{ name: 'Type', type: 'radio', options: ['TMT Bars', 'Structural', 'Sheets'] }] },
      { name: 'Tiles' },
      { name: 'Pipes' }
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
      { name: 'Seeds' },
      { name: 'Fertilizer' },
      { name: 'Machinery' },
      { name: 'Irrigation' }
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
      { name: 'Salon', parameters: [{ name: 'Service Type', type: 'pricelist', options: ['Haircut', 'Coloring', 'Styling'] }] },
      { name: 'Spa' },
      { name: 'Beauty Parlour' }
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
      { name: 'Doctor', parameters: [{ name: 'Specialization', type: 'text', placeholder: 'e.g. Cardiologist' }, { name: 'Consultation', type: 'radio', options: ['In-Clinic', 'Online'] }] },
      { name: 'Dentist' },
      { name: 'Physiotherapy' }
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
      { name: 'Electrician' },
      { name: 'Plumber' },
      { name: 'Carpenter' }
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
      { name: 'Consultant', parameters: [{ name: 'Field', type: 'text', placeholder: 'e.g. IT, Management' }] },
      { name: 'Lawyer' },
      { name: 'Accountant' }
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
      { name: 'Car Washing Center', parameters: [{ name: 'Vehicle Type', type: 'pricelist', options: ['Mini Car', 'Car', 'Bike', 'Bus', 'Truck'] }] }
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
      { name: 'Restaurant', parameters: [{ name: 'Booking Options', type: 'checkbox', options: ['Table Booking', 'Private Dining'] }] },
      { name: 'Cafe', parameters: [{ name: 'Booking Options', type: 'checkbox', options: ['Table Booking', 'Event Space'] }] },
      { name: 'Food Shop', parameters: [{ name: 'Type', type: 'radio', options: ['Bakery', 'Sweet Shop', 'Grocery'] }] }
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
      { name: 'Car', parameters: [{ name: 'Fuel Type', type: 'radio', options: ['Petrol', 'Diesel', 'EV', 'Hybrid'] }, { name: 'Transmission', type: 'radio', options: ['Manual', 'Automatic'] }] },
      { name: 'Bike' },
      { name: 'Truck' },
      { name: 'Bus' },
      { name: 'Tractor' },
      { name: 'Construction Vehicle' }
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
