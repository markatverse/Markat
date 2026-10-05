"use client";
import React from 'react';
import {
  MonitorSmartphone, HardHat, Leaf, Scissors, Droplet,
  Stethoscope, Wrench, Briefcase, Laptop, Car, Zap,
  Hammer, Brush, BookOpen, Camera, Calendar,
  ShoppingBag, Package, Truck, Factory, Sparkles,
  Heart, Home, Shirt, Smartphone, Tv, Globe,
  type LucideIcon
} from 'lucide-react';

/**
 * Maps Lucide icon name strings to actual components.
 * Used throughout the app where categories store icon names as strings.
 */
const iconMap: Record<string, LucideIcon> = {
  MonitorSmartphone,
  HardHat,
  Leaf,
  Scissors,
  Droplet,
  Stethoscope,
  Wrench,
  Briefcase,
  Laptop,
  Car,
  Zap,
  Hammer,
  Brush,
  BookOpen,
  Camera,
  Calendar,
  ShoppingBag,
  Package,
  Truck,
  Factory,
  Sparkles,
  Heart,
  Home,
  Shirt,
  Smartphone,
  Tv,
  Globe,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Resolves a Lucide icon name string to a rendered icon component.
 * Falls back to a 📁 emoji if the name is not found in the map.
 */
export default function CategoryIcon({ name, className = "w-8 h-8", size }: CategoryIconProps) {
  const IconComponent = iconMap[name];
  
  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }
  
  // If `name` is an emoji (starts with a non-ASCII char), render it directly
  if (name && /^\p{Emoji}/u.test(name)) {
    return <span className="text-2xl">{name}</span>;
  }
  
  // Fallback
  return <span className="text-2xl">📁</span>;
}

export { iconMap };
