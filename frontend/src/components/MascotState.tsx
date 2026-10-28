"use client";
import React from 'react';
import Link from 'next/link';

export type MascotStateType =
  | '404'
  | 'server-error'
  | 'no-internet'
  | 'no-search'
  | 'cart-empty'
  | 'access-denied'
  | 'payment-failed'
  | 'maintenance'
  | 'something-wrong'
  | 'try-again';

export const MASCOT_STORAGE_KEY = 'markat_mascot_config';

export interface MascotStateConfig {
  image: string;
  cardImage: string;
  title: string;
  description: string;
  actionText: string;
  defaultHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  enabled?: boolean;
  category?: 'error' | 'ux' | 'network' | 'system';
}

export const DEFAULT_MASCOT_CONFIGS: Record<MascotStateType, MascotStateConfig> = {
  '404': {
    image: '/mascot/404.webp',
    cardImage: '/mascot/404-card.webp',
    title: '404 Not Found',
    description: "Oops! This page seems to have gone on a different journey. Let's get you back.",
    actionText: 'Go to Home',
    defaultHref: '/',
    enabled: true,
    category: 'error',
  },
  'server-error': {
    image: '/mascot/server-error.webp',
    cardImage: '/mascot/server-error-card.webp',
    title: 'Server Error',
    description: 'Something went wrong on our side. Our team is already on it. Please try again later.',
    actionText: 'Try Again',
    defaultHref: '/',
    enabled: true,
    category: 'system',
  },
  'no-internet': {
    image: '/mascot/no-internet.webp',
    cardImage: '/mascot/no-internet-card.webp',
    title: 'No Internet',
    description: 'Looks like you are offline. Check your internet connection and try again.',
    actionText: 'Retry',
    enabled: true,
    category: 'network',
  },
  'no-search': {
    image: '/mascot/no-search.webp',
    cardImage: '/mascot/no-search-card.webp',
    title: 'No Search Results',
    description: "We couldn't find anything for your search.",
    actionText: 'Try Different Keywords',
    defaultHref: '/search',
    enabled: true,
    category: 'ux',
  },
  'cart-empty': {
    image: '/mascot/cart-empty.webp',
    cardImage: '/mascot/cart-empty-card.webp',
    title: 'Your Cart is Empty',
    description: "Looks like you haven't added anything yet.",
    actionText: 'Start Shopping',
    defaultHref: '/',
    enabled: true,
    category: 'ux',
  },
  'access-denied': {
    image: '/mascot/access-denied.webp',
    cardImage: '/mascot/access-denied-card.webp',
    title: 'Access Denied',
    description: "You don't have permission to access this page.",
    actionText: 'Go Back',
    defaultHref: '/',
    enabled: true,
    category: 'error',
  },
  'payment-failed': {
    image: '/mascot/payment-failed.webp',
    cardImage: '/mascot/payment-failed-card.webp',
    title: 'Payment Failed',
    description: "Uh-oh! Your payment couldn't be completed. Please try again or use a different method.",
    actionText: 'Try Again',
    enabled: true,
    category: 'system',
  },
  'maintenance': {
    image: '/mascot/maintenance.webp',
    cardImage: '/mascot/maintenance-card.webp',
    title: 'Under Maintenance',
    description: "We're making MarkatVerse better for you. Please check back soon.",
    actionText: 'Check Back Later',
    defaultHref: '/',
    enabled: true,
    category: 'system',
  },
  'something-wrong': {
    image: '/mascot/something-wrong.webp',
    cardImage: '/mascot/something-wrong-card.webp',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    actionText: 'Try Again',
    enabled: true,
    category: 'system',
  },
  'try-again': {
    image: '/mascot/try-again.webp',
    cardImage: '/mascot/try-again-card.webp',
    title: "Let's Try Again!",
    description: "Don't worry, we're here to help. Please try again.",
    actionText: 'Try Again',
    defaultHref: '/',
    enabled: true,
    category: 'ux',
  },
};

export interface MascotStateProps {
  state: MascotStateType;
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryText?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
  className?: string;
}

export default function MascotState({
  state,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryText,
  secondaryHref,
  onSecondaryAction,
  compact = false,
  className = '',
}: MascotStateProps) {
  const [adminConfig, setAdminConfig] = React.useState<MascotStateConfig | null>(null);

  React.useEffect(() => {
    const syncConfig = () => {
      try {
        const raw = localStorage.getItem(MASCOT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed[state]) {
            setAdminConfig(parsed[state]);
            return;
          }
        }
      } catch {}
      setAdminConfig(null);
    };

    syncConfig();

    const handleUpdate = () => syncConfig();
    window.addEventListener('markat_mascot_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('markat_mascot_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [state]);

  const baseConfig = adminConfig || DEFAULT_MASCOT_CONFIGS[state] || DEFAULT_MASCOT_CONFIGS['something-wrong'];
  
  if (baseConfig.enabled === false) {
    return null;
  }

  const finalTitle = title ?? baseConfig.title;
  const finalDesc = description ?? baseConfig.description;
  const finalActionText = actionText ?? baseConfig.actionText;
  const targetHref = actionHref ?? baseConfig.defaultHref;
  const finalSecondaryText = secondaryText ?? baseConfig.secondaryText;
  const finalSecondaryHref = secondaryHref ?? baseConfig.secondaryHref;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-6 px-4 max-w-sm mx-auto' : 'py-12 sm:py-16 px-4 max-w-md mx-auto min-h-[380px]'
      } ${className}`}
    >
      {/* 3D Mascot Character Illustration */}
      <div className={`relative ${compact ? 'w-36 h-36' : 'w-48 sm:w-56 h-48 sm:h-56'} mb-4 shrink-0 transition-transform duration-300 hover:scale-105`}>
        <img
          src={baseConfig.image}
          alt={finalTitle}
          loading="eager"
          className="w-full h-full object-contain drop-shadow-sm filter contrast-105"
        />
      </div>

      {/* MarkatVerse Brand Wordmark */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span className="text-sm font-black tracking-tight text-slate-800">
          Markat<span className="text-blue-600">Verse</span>
        </span>
      </div>

      {/* Heading */}
      <h2 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black text-slate-900 tracking-tight mb-2`}>
        {finalTitle}
      </h2>

      {/* Subtitle / Description */}
      <p className={`text-slate-500 font-medium ${compact ? 'text-xs' : 'text-xs sm:text-sm'} leading-relaxed max-w-xs mb-6`}>
        {finalDesc}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center w-full">
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md shadow-blue-600/25 cursor-pointer"
          >
            {finalActionText}
          </button>
        ) : targetHref ? (
          <Link
            href={targetHref}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md shadow-blue-600/25 inline-flex items-center justify-center"
          >
            {finalActionText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md shadow-blue-600/25 cursor-pointer"
          >
            {finalActionText}
          </button>
        )}

        {finalSecondaryText && (
          finalSecondaryHref ? (
            <Link
              href={finalSecondaryHref}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition-all"
            >
              {finalSecondaryText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-full transition-all cursor-pointer"
            >
              {finalSecondaryText}
            </button>
          )
        )}
      </div>
    </div>
  );
}
