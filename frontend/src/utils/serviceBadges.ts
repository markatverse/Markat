import React from 'react';
import {
  UtensilsCrossed, Car, Stethoscope, Scissors, Sparkles,
  Scale, Calculator, Building2, Video, Code, Palette,
  Briefcase, PartyPopper, Wrench, Camera, Truck, Dumbbell
} from 'lucide-react';

export interface ServiceBadgeInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/**
 * Returns a standardized, tailored visual badge configuration for any service product.
 * Returns null if the item is purely retail/physical merchandise.
 */
export function getServiceBadge(product: any): ServiceBadgeInfo | null {
  if (!product) return null;

  const cat = (product.category || '').toLowerCase();
  const sub = (product.subcategory || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const allText = `${cat} ${sub} ${name}`;

  // 1. Food & Dining
  if (
    allText.includes('restaurant') ||
    allText.includes('cafe') ||
    allText.includes('dining') ||
    allText.includes('bistro') ||
    allText.includes('food') ||
    allText.includes('bar & grill') ||
    allText.includes('eatery') ||
    allText.includes('bakery') ||
    cat.includes('food') ||
    cat.includes('dining')
  ) {
    return {
      label: 'Dining Venue',
      icon: UtensilsCrossed,
      color: 'text-rose-400'
    };
  }

  // 2. Car Wash & Auto Detailing
  if (
    allText.includes('car wash') ||
    allText.includes('auto wash') ||
    allText.includes('detailing') ||
    allText.includes('vehicle wash') ||
    allText.includes('foam wash') ||
    cat.includes('car wash') ||
    cat.includes('automobile')
  ) {
    return {
      label: 'Auto Wash & Detailing',
      icon: Car,
      color: 'text-cyan-400'
    };
  }

  // 3. Healthcare, Doctor, Clinic, Hospital, Dental
  if (
    allText.includes('doctor') ||
    allText.includes('clinic') ||
    allText.includes('hospital') ||
    allText.includes('dentist') ||
    allText.includes('dental') ||
    allText.includes('opd') ||
    allText.includes('medical') ||
    allText.includes('physician') ||
    allText.includes('pediatric') ||
    cat.includes('doctor') ||
    cat.includes('clinic')
  ) {
    return {
      label: 'Clinic & Doctor OPD',
      icon: Stethoscope,
      color: 'text-emerald-400'
    };
  }

  // 4. Salon, Hair, Beauty Parlour, Barber
  if (
    allText.includes('salon') ||
    allText.includes('saloon') ||
    allText.includes('hair') ||
    allText.includes('beauty parlour') ||
    allText.includes('barber') ||
    allText.includes('haircut') ||
    allText.includes('makeup') ||
    cat.includes('salon') ||
    cat.includes('beauty')
  ) {
    return {
      label: 'Salon & Hair Studio',
      icon: Scissors,
      color: 'text-fuchsia-400'
    };
  }

  // 5. Spa & Wellness & Massage
  if (
    allText.includes('spa') ||
    allText.includes('massage') ||
    allText.includes('wellness') ||
    allText.includes('ayurveda') ||
    allText.includes('therapy')
  ) {
    return {
      label: 'Spa & Wellness',
      icon: Sparkles,
      color: 'text-teal-400'
    };
  }

  // 6. Fitness, Gym & Sports Trainer
  if (
    allText.includes('gym') ||
    allText.includes('fitness') ||
    allText.includes('trainer') ||
    allText.includes('yoga') ||
    allText.includes('crossfit')
  ) {
    return {
      label: 'Fitness & Gym Studio',
      icon: Dumbbell,
      color: 'text-amber-400'
    };
  }

  // 7. Legal, Lawyer, Advocate, Law Firm
  if (
    allText.includes('lawyer') ||
    allText.includes('legal') ||
    allText.includes('advocate') ||
    allText.includes('attorney') ||
    allText.includes('court') ||
    allText.includes('litigation') ||
    allText.includes('counsel')
  ) {
    return {
      label: 'Legal Practice & Counsel',
      icon: Scale,
      color: 'text-amber-400'
    };
  }

  // 8. Chartered Accountant, Tax, Audit, CS
  if (
    allText.includes('chartered') ||
    allText.includes('accountant') ||
    allText.includes(' ca ') ||
    sub.includes('ca') ||
    allText.includes('audit') ||
    allText.includes('tax') ||
    allText.includes('gst') ||
    allText.includes('financial advisor') ||
    allText.includes('company secretary')
  ) {
    return {
      label: 'Chartered Accountant & Tax',
      icon: Calculator,
      color: 'text-blue-400'
    };
  }

  // 9. Architecture & Interior Design
  if (
    allText.includes('architect') ||
    allText.includes('interior design') ||
    allText.includes('interior decor') ||
    allText.includes('floor plan') ||
    allText.includes('3d elevation')
  ) {
    return {
      label: 'Architectural & Interior Design',
      icon: Building2,
      color: 'text-yellow-400'
    };
  }

  // 10. Freelance Video Editing & Media
  if (
    allText.includes('video editor') ||
    allText.includes('reel') ||
    allText.includes('motion graphic') ||
    allText.includes('animat') ||
    allText.includes('youtube editor') ||
    allText.includes('cinematic') ||
    sub.includes('video')
  ) {
    return {
      label: 'Freelance Video & Media Editor',
      icon: Video,
      color: 'text-indigo-400'
    };
  }

  // 11. Freelance Software / Web / App Development
  if (
    allText.includes('developer') ||
    allText.includes('coder') ||
    allText.includes('programmer') ||
    allText.includes('web development') ||
    allText.includes('software') ||
    allText.includes('fullstack') ||
    allText.includes('frontend') ||
    allText.includes('backend') ||
    allText.includes('mobile app') ||
    sub.includes('developer')
  ) {
    return {
      label: 'Freelance Tech & Web Developer',
      icon: Code,
      color: 'text-violet-400'
    };
  }

  // 12. Freelance UI/UX & Graphic Design
  if (
    allText.includes('ui/ux') ||
    allText.includes('graphic design') ||
    allText.includes('figma') ||
    allText.includes('logo design') ||
    allText.includes('branding') ||
    allText.includes('illustrat') ||
    allText.includes('photo edit') ||
    sub.includes('design')
  ) {
    return {
      label: 'Freelance UI/UX & Graphic Design',
      icon: Palette,
      color: 'text-pink-400'
    };
  }

  // 13. General Freelancer
  if (
    cat.includes('freelance') ||
    sub.includes('freelance') ||
    allText.includes('freelancer') ||
    allText.includes('copywriting') ||
    allText.includes('seo expert') ||
    allText.includes('digital marketer')
  ) {
    return {
      label: 'Freelance Expert',
      icon: Briefcase,
      color: 'text-purple-400'
    };
  }

  // 14. Event & Wedding Organizer
  if (
    allText.includes('wedding') ||
    allText.includes('event') ||
    allText.includes('organizer') ||
    allText.includes('party') ||
    allText.includes('catering') ||
    allText.includes('stage decor') ||
    allText.includes('dj setup') ||
    cat.includes('organizer') ||
    cat.includes('event')
  ) {
    return {
      label: 'Event & Wedding Planner',
      icon: PartyPopper,
      color: 'text-orange-400'
    };
  }

  // 15. Photography & Cinematography
  if (
    allText.includes('photo') ||
    allText.includes('photographer') ||
    allText.includes('photoshoot') ||
    allText.includes('camera') ||
    allText.includes('studio shoot')
  ) {
    return {
      label: 'Photography & Studio',
      icon: Camera,
      color: 'text-sky-400'
    };
  }

  // 16. Transport, Moving & Logistics
  if (
    allText.includes('transport') ||
    allText.includes('cargo') ||
    allText.includes('logistics') ||
    allText.includes('movers') ||
    allText.includes('packer')
  ) {
    return {
      label: 'Transport & Logistics',
      icon: Truck,
      color: 'text-amber-400'
    };
  }

  // 17. Home Repair, Maintenance & Skilled Trades
  if (
    allText.includes('electrician') ||
    allText.includes('plumber') ||
    allText.includes('carpenter') ||
    allText.includes('ac repair') ||
    allText.includes('appliance') ||
    allText.includes('cleaning') ||
    allText.includes('pest control') ||
    allText.includes('painting') ||
    allText.includes('home service') ||
    allText.includes('repair')
  ) {
    return {
      label: 'Home & Maintenance Service',
      icon: Wrench,
      color: 'text-amber-400'
    };
  }

  // 18. General Services
  if (
    product.primaryType === 'SERVICE' ||
    cat.includes('service') ||
    sub.includes('service') ||
    product.duration ||
    product.bookingModel
  ) {
    return {
      label: 'Verified Service Provider',
      icon: Sparkles,
      color: 'text-teal-400'
    };
  }

  return null;
}
