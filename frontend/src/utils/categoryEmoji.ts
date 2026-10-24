/**
 * Category & Subcategory Emoji Utility
 * Provides comprehensive, bulletproof emoji icons for all marketplace categories,
 * subcategories, and Lucide icon mappings across the MarkatVerse admin panel and frontend.
 */

// Mapping of Lucide icon string identifiers to matching emojis
const LUCIDE_TO_EMOJI: Record<string, string> = {
  MonitorSmartphone: '💻',
  Smartphone: '📱',
  Tv: '📺',
  Laptop: '💻',
  HardHat: '🏗️',
  Leaf: '🌾',
  Shirt: '👕',
  Home: '🏠',
  ShoppingBag: '🛒',
  ShieldPlus: '🩺',
  Wrench: '🔧',
  Cpu: '⚙️',
  Sparkles: '✨',
  Activity: '🏋️',
  BookOpen: '📚',
  Baby: '🧸',
  Scissors: '✂️',
  Droplet: '💧',
  Stethoscope: '🩺',
  Zap: '⚡',
  Hammer: '🔨',
  Briefcase: '💼',
  Car: '🚗',
  Brush: '🎨',
  Camera: '📸',
  Calendar: '🎉',
  Utensils: '🍽️',
  Pizza: '🍕',
  HeartPulse: '🩺',
  Tractor: '🚜',
  Truck: '🚚',
  Factory: '🏭',
  Package: '📦',
  Box: '📦',
  Globe: '🌐',
  Heart: '❤️',
};

// Exact category name match dictionary (case-insensitive keys)
const EXACT_CATEGORY_EMOJIS: Record<string, string> = {
  // Products
  'electronics': '💻',
  'construction': '🏗️',
  'construction materials': '🏗️',
  'agriculture': '🌾',
  'fashion': '👕',
  'home & kitchen': '🏠',
  'home': '🏠',
  'grocery & fmcg': '🛒',
  'grocery': '🛒',
  'healthcare & medical devices': '🩺',
  'healthcare': '🩺',
  'automotive parts & accessories': '🚗',
  'automotive parts': '🚗',
  'industrial machinery & tools': '⚙️',
  'industrial machinery': '⚙️',
  'beauty, cosmetics & personal care': '💅',
  'beauty': '💅',
  'cosmetics': '💄',
  'sports, fitness & outdoor': '🏋️',
  'sports': '⚽',
  'books, stationery & office supplies': '📚',
  'books': '📚',
  'stationery': '📝',
  'baby care & toys': '🧸',
  'toys': '🧸',
  'baby care': '👶',

  // Services
  'services': '🛠️',
  'home services': '🛠️',
  'salon': '💇',
  'spa': '🧖‍♀️',
  'doctor': '🩺',
  'plumber': '🚰',
  'electrician': '⚡',
  'carpenter': '🪚',
  'professional': '💼',
  'consultant': '💼',
  'consulting': '💼',
  'freelancer': '💻',
  'mechanic': '🚘',
  'cleaner': '🧹',
  'cleaning': '🧹',
  'painter': '🎨',
  'tutor': '🎓',
  'photographer': '📸',
  'photography': '📸',
  'event planner': '🎉',
  'events': '🎉',
  'food & dining': '🍽️',
  'dining': '🍽️',
  'restaurant': '🍽️',

  // Vehicles & Automobile Services
  'sales & rentals': '🔑',
  'rentals': '🔑',
  'car wash': '🧼',
  'car wash & automobile': '🚗🧼',
  'automobile & car wash': '🚗🧼',
  'automobile / car wash': '🚗🧼',
  'vehicles': '🚗',
  'vehicle': '🚗',
  'automobile': '🚗',
  'auto': '🚗',
  'transport': '🚚',
  'logistics': '🚚',
  'b2b': '🏢',
  'organizers': '📋',
};

// Subcategory keyword-to-emoji mapping
const SUBCATEGORY_EMOJIS: Record<string, string> = {
  'mobile': '📱',
  'smartphone': '📱',
  'feature phone': '📞',
  'laptop': '💻',
  'tv': '📺',
  'camera': '📷',
  'cement': '🧱',
  'steel & tmt': '🏗️',
  'steel': '🏗️',
  'tiles & marbles': '🏛️',
  'pipes & fittings': '🚰',
  'paints & wall primer': '🎨',
  'bricks & blocks': '🧱',
  'seeds': '🌱',
  'fertilizer & nutrition': '🧪',
  'machinery & equipment': '🚜',
  'irrigation & drip': '💧',
  'men clothing': '👔',
  'women clothing': '👗',
  'footwear': '👟',
  'accessories': '🕶️',
  'kitchen appliances': '🍳',
  'cookware & tableware': '🍽️',
  'furniture & decor': '🛋️',
  'staples & grains': '🌾',
  'edible oils & ghee': '🫒',
  'snacks & packaged food': '🍿',
  'beverages & tea/coffee': '☕',
  'medical equipment & monitors': '🩺',
  'surgical & clinic supplies': '🩹',
  'wellness & nutrition supplements': '💊',
  'car spare parts': '🚗',
  'two-wheeler spares': '🏍️',
  'car electronics & interior': '📻',
  'lubricants & car care': '🛢️',
  'power tools & workshop equipment': '🔨',
  'generators & electric motors': '⚡',
  'packaging & warehouse material': '📦',
  'skincare & face care': '🧴',
  'hair care products': '💇',
  'color cosmetics & makeup': '💄',
  'fragrances & deodorants': '🌸',
  'gym & fitness gear': '🏋️',
  'racquet & ball sports': '🏸',
  'books & educational material': '📖',
  'office stationery & paper products': '📝',
  'baby essentials & diapers': '👶',
  'educational toys & games': '🧩',
  'hair salon': '💇',
  'beauty parlour': '💅',
  'nail art studio': '💅',
  'ayurvedic & body spa': '🧖‍♀️',
  'foot reflexology': '🦶',
  'clinic & opd consultation': '👨‍⚕️',
  'dental care & surgery': '🦷',
  'physiotherapy & rehab': '🏃‍♂️',
  'plumbing repair & installation': '🚰',
  'electrical repairs & wiring': '⚡',
  'carpentry & woodwork': '🪚',
  'business & legal advisory': '💼',
  'digital & creative services': '💻',
  'automobile repair & servicing': '🚘',
  'home & office deep cleaning': '🧹',
  'painting & waterproofing': '🎨',
  'academic tutoring & coaching': '🎓',
  'photography & cinematography': '📸',
  'event & wedding decor': '🎪',
  'birthday & party planning': '🎂',
  'corporate events & galas': '🥂',
  'cafe & bistro': '☕',
  'food shop & bakery': '🥐',
  'car': '🚗',
  'bike & scooter': '🏍️',
  'truck & commercial': '🚚',
  'bus & van': '🚌',
  'tractor & farm equipment': '🚜',
  'construction vehicle': '🚜',
};

/**
 * Checks if a string starts with or contains an actual emoji character.
 */
export function isEmoji(str?: string | null): boolean {
  if (!str) return false;
  // Regex to test Unicode Emoji characters
  return /\p{Extended_Pictographic}/u.test(str.trim());
}

/**
 * Resolves an emoji for a given category object or category name.
 * Priority:
 * 1. If `cat.icon` is an emoji, return it.
 * 2. If `cat.icon` is a Lucide name, check LUCIDE_TO_EMOJI.
 * 3. Check EXACT_CATEGORY_EMOJIS by category name.
 * 4. Check keyword match on category name.
 * 5. Fallback based on primaryType (PRODUCT: 📦, SERVICE: 🛠️, VEHICLE: 🚗) or '🏷️'.
 */
export function getCategoryEmoji(catOrName?: any): string {
  if (!catOrName) return '🏷️';

  const name: string = typeof catOrName === 'string' ? catOrName : (catOrName.name || '');
  const icon: string = typeof catOrName === 'object' && catOrName ? (catOrName.icon || '') : '';
  const primaryType: string = typeof catOrName === 'object' && catOrName ? (catOrName.primaryType || '') : '';

  // 1. Direct emoji in icon field
  if (isEmoji(icon)) {
    return icon.trim();
  }

  // 2. Lucide icon name mapping
  if (icon && LUCIDE_TO_EMOJI[icon]) {
    return LUCIDE_TO_EMOJI[icon];
  }

  // 3. Exact category name match
  const normalized = name.trim().toLowerCase();
  if (EXACT_CATEGORY_EMOJIS[normalized]) {
    return EXACT_CATEGORY_EMOJIS[normalized];
  }

  // 4. Keyword fuzzy matches
  if (normalized.includes('electr') && (normalized.includes('gadget') || normalized.includes('tech') || normalized.includes('phone') || normalized.includes('comput') || normalized.includes('mobile'))) {
    return '💻';
  }
  if (normalized.includes('construct') || normalized.includes('cement') || normalized.includes('steel') || normalized.includes('brick')) {
    return '🏗️';
  }
  if (normalized.includes('agri') || normalized.includes('farm') || normalized.includes('crop') || normalized.includes('seed')) {
    return '🌾';
  }
  if (normalized.includes('fashion') || normalized.includes('cloth') || normalized.includes('apparel') || normalized.includes('wear')) {
    return '👕';
  }
  if (normalized.includes('kitchen') || normalized.includes('cookware')) {
    return '🍳';
  }
  if (normalized.includes('home') || normalized.includes('furnitur') || normalized.includes('decor')) {
    return '🏠';
  }
  if (normalized.includes('grocer') || normalized.includes('fmcg') || normalized.includes('supermarket') || normalized.includes('staple')) {
    return '🛒';
  }
  if (normalized.includes('health') || normalized.includes('medic') || normalized.includes('pharma') || normalized.includes('clinic')) {
    return '🩺';
  }
  if (normalized.includes('doctor')) {
    return '🩺';
  }
  if (normalized.includes('dental') || normalized.includes('dentist')) {
    return '🦷';
  }
  if (normalized.includes('machin') || normalized.includes('industrial') || normalized.includes('generator') || normalized.includes('tool')) {
    return '⚙️';
  }
  if (normalized.includes('beaut') || normalized.includes('cosmetic') || normalized.includes('makeup') || normalized.includes('skin')) {
    return '💅';
  }
  if (normalized.includes('salon') || normalized.includes('hair') || normalized.includes('barber')) {
    return '💇';
  }
  if (normalized.includes('spa') || normalized.includes('massage') || normalized.includes('wellness')) {
    return '🧖‍♀️';
  }
  if (normalized.includes('sport') || normalized.includes('fit') || normalized.includes('gym')) {
    return '🏋️';
  }
  if (normalized.includes('book') || normalized.includes('stationer') || normalized.includes('office') || normalized.includes('paper')) {
    return '📚';
  }
  if (normalized.includes('baby') || normalized.includes('toy') || normalized.includes('kid') || normalized.includes('diaper')) {
    return '🧸';
  }
  if (normalized.includes('plumb') || normalized.includes('pipe') || normalized.includes('leak')) {
    return '🚰';
  }
  if (normalized.includes('electric') || normalized.includes('wiring')) {
    return '⚡';
  }
  if (normalized.includes('carpent') || normalized.includes('wood')) {
    return '🪚';
  }
  if (normalized.includes('mechanic') || normalized.includes('garage') || normalized.includes('overhaul')) {
    return '🚘';
  }
  if (normalized.includes('clean') || normalized.includes('sanit') || normalized.includes('wash') || normalized.includes('maid')) {
    return '🧹';
  }
  if (normalized.includes('paint')) {
    return '🎨';
  }
  if (normalized.includes('tutor') || normalized.includes('teach') || normalized.includes('coach') || normalized.includes('educat')) {
    return '🎓';
  }
  if (normalized.includes('photo') || normalized.includes('cinemat') || normalized.includes('video')) {
    return '📸';
  }
  if (normalized.includes('event') || normalized.includes('wedding') || normalized.includes('party')) {
    return '🎉';
  }
  if (normalized.includes('food') || normalized.includes('dining') || normalized.includes('restaurant') || normalized.includes('cafe') || normalized.includes('bistro') || normalized.includes('bakery')) {
    return '🍽️';
  }
  if (normalized.includes('consult') || normalized.includes('advis') || normalized.includes('law') || normalized.includes('account') || normalized.includes('profess')) {
    return '💼';
  }
  if (normalized.includes('freelanc') || normalized.includes('software') || normalized.includes('develop') || normalized.includes('design')) {
    return '💻';
  }
  if (normalized.includes('rental') || normalized.includes('lease')) {
    return '🔑';
  }
  if (normalized.includes('car') || normalized.includes('vehicle') || normalized.includes('auto') || normalized.includes('bike') || normalized.includes('motor')) {
    return '🚗';
  }
  if (normalized.includes('transport') || normalized.includes('logist') || normalized.includes('cargo') || normalized.includes('freight')) {
    return '🚚';
  }

  // 5. Fallback based on primaryType
  if (primaryType === 'PRODUCT') return '📦';
  if (primaryType === 'SERVICE') return '🛠️';
  if (primaryType === 'VEHICLE') return '🚗';

  return '🏷️';
}

/**
 * Returns an emoji for a subcategory name.
 */
export function getSubcategoryEmoji(subName: string, parentName?: string): string {
  if (!subName) return '🏷️';
  const norm = subName.trim().toLowerCase();

  if (SUBCATEGORY_EMOJIS[norm]) {
    return SUBCATEGORY_EMOJIS[norm];
  }

  // Partial match checks
  for (const [key, emoji] of Object.entries(SUBCATEGORY_EMOJIS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return emoji;
    }
  }

  // Fallback to parent category emoji
  if (parentName) {
    return getCategoryEmoji(parentName);
  }

  return '🏷️';
}

/**
 * Popular presets for the category Emoji / Icon picker.
 */
export const CATEGORY_EMOJI_PRESETS = [
  { emoji: '💻', label: 'Electronics & Tech' },
  { emoji: '📱', label: 'Mobiles & Gadgets' },
  { emoji: '🏗️', label: 'Construction & Steel' },
  { emoji: '🌾', label: 'Agriculture & Farming' },
  { emoji: '👕', label: 'Fashion & Clothing' },
  { emoji: '🏠', label: 'Home & Living' },
  { emoji: '🍳', label: 'Kitchen & Cookware' },
  { emoji: '🛒', label: 'Grocery & FMCG' },
  { emoji: '🩺', label: 'Healthcare & Doctor' },
  { emoji: '🚗', label: 'Automotive & Vehicles' },
  { emoji: '⚙️', label: 'Industrial Machinery' },
  { emoji: '💅', label: 'Beauty & Cosmetics' },
  { emoji: '🏋️', label: 'Sports & Fitness' },
  { emoji: '📚', label: 'Books & Stationery' },
  { emoji: '🧸', label: 'Toys & Baby Care' },
  { emoji: '💇', label: 'Salon & Hair' },
  { emoji: '🧖‍♀️', label: 'Spa & Wellness' },
  { emoji: '🚰', label: 'Plumbing & Pipes' },
  { emoji: '⚡', label: 'Electrical & Power' },
  { emoji: '🪚', label: 'Carpentry & Woodwork' },
  { emoji: '💼', label: 'Professional & Business' },
  { emoji: '🍽️', label: 'Food & Dining' },
  { emoji: '🎨', label: 'Painting & Arts' },
  { emoji: '📸', label: 'Photography & Media' },
  { emoji: '🎉', label: 'Events & Parties' },
  { emoji: '🔑', label: 'Sales & Rentals' },
  { emoji: '🧹', label: 'Cleaning & Sanitation' },
  { emoji: '🚚', label: 'Transport & Logistics' },
  { emoji: '🏢', label: 'B2B Wholesale' },
  { emoji: '💎', label: 'Jewelry & Luxury' },
];
