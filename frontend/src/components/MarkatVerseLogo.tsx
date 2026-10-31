import React from 'react';

interface MarkatVerseLogoProps {
  className?: string;
  variant?: 'svg' | 'png' | 'webp';
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function MarkatVerseLogo({
  className = 'h-10 w-auto',
  variant = 'svg',
  priority = true,
  width = 164,
  height = 40,
}: MarkatVerseLogoProps) {
  const src = variant === 'svg' ? '/logo.svg' : variant === 'webp' ? '/logo-optimized.webp' : '/logo.png';

  return (
    <picture>
      <source srcSet="/logo.svg" type="image/svg+xml" />
      <source srcSet="/logo-optimized.webp" type="image/webp" />
      <img
        src={src}
        alt="MarkatVerse - Modern Commerce Platform"
        width={width}
        height={height}
        className={`object-contain ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="sync"
      />
    </picture>
  );
}

