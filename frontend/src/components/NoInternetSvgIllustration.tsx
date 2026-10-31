"use client";

import React from 'react';

interface NoInternetSvgIllustrationProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function NoInternetSvgIllustration({
  className = "w-full h-full object-contain",
  style,
}: NoInternetSvgIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 360"
      fill="none"
      className={className}
      style={style}
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      role="img"
      aria-label="No Internet Offline Mascot"
    >
      <defs>
        {/* Soft Ambient Glow Filters */}
        <filter id="msSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1E293B" floodOpacity="0.12" />
        </filter>
        <filter id="msPillShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#E11D48" floodOpacity="0.25" />
        </filter>
        <filter id="msBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2563EB" floodOpacity="0.2" />
        </filter>

        {/* Color Gradients */}
        <linearGradient id="msCloudBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <linearGradient id="msCloudInnerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="msBrandBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="msAlertRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <linearGradient id="msPlugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="msCordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>

      {/* Ambient Ground Shadow */}
      <ellipse cx="200" cy="326" rx="110" ry="14" fill="#CBD5E1" opacity="0.45" />
      <ellipse cx="200" cy="326" rx="65" ry="8" fill="#94A3B8" opacity="0.35" />

      {/* Background Decorative Signal Dots & Sparks */}
      <g opacity="0.75">
        <circle cx="82" cy="115" r="3" fill="#93C5FD" />
        <circle cx="68" cy="155" r="2" fill="#CBD5E1" />
        <circle cx="320" cy="100" r="3" fill="#93C5FD" />
        <circle cx="334" cy="140" r="2" fill="#CBD5E1" />
        <path d="M 95 85 L 102 92 M 102 85 L 95 92" stroke="#FDA4AF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 305 75 L 312 82 M 312 75 L 305 82" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Top Disconnected Wi-Fi Radar Arcs */}
      <g transform="translate(200, 78)">
        <path d="M -60 -18 A 65 65 0 0 1 60 -18" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" strokeDasharray="16 10" />
        <path d="M -42 -4 A 45 45 0 0 1 42 -4" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
        <path d="M -24 10 A 25 25 0 0 1 24 10" fill="none" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="0" cy="22" r="5" fill="#E11D48" />
      </g>

      {/* Main Mascot Cloud Character Body */}
      <g filter="url(#msSoftShadow)">
        <path
          d="M 135 285 C 105 285 80 262 80 232 C 80 220 84 209 91 200 C 81 189 75 174 75 158 C 75 124 102 97 136 97 C 147 97 158 100 168 106 C 182 82 208 66 238 66 C 281 66 316 100 317 143 C 324 148 329 157 329 167 C 329 184 316 198 300 200 C 305 209 308 220 308 232 C 308 262 283 285 253 285 Z"
          fill="url(#msCloudBodyGrad)"
          stroke="#E2E8F0"
          strokeWidth="3"
        />

        <path
          d="M 140 102 C 165 92 205 76 238 72 C 275 72 308 102 312 138"
          fill="none"
          stroke="url(#msCloudInnerGlow)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Mascot Expressive Face */}
      <g>
        {/* Left Eye */}
        <ellipse cx="166" cy="180" rx="9" ry="12" fill="#1E293B" />
        <circle cx="163" cy="176" r="3.5" fill="#FFFFFF" />
        <circle cx="168" cy="183" r="1.5" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="236" cy="180" rx="9" ry="12" fill="#1E293B" />
        <circle cx="233" cy="176" r="3.5" fill="#FFFFFF" />
        <circle cx="238" cy="183" r="1.5" fill="#FFFFFF" />

        {/* Blushing Cheeks */}
        <ellipse cx="148" cy="194" rx="10" ry="6" fill="#FDA4AF" opacity="0.6" />
        <ellipse cx="254" cy="194" rx="10" ry="6" fill="#FDA4AF" opacity="0.6" />

        {/* Apologetic Smile */}
        <path d="M 193 194 Q 201 189 209 194" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />

        {/* Eyebrows */}
        <path d="M 158 163 Q 166 160 174 164" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 228 164 Q 236 160 244 163" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* MarkatVerse Chest Mini-Cart Badge */}
      <g transform="translate(192, 218)">
        <rect x="-12" y="-10" width="24" height="20" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
        <path d="M -6 4 L -6 -3 L -1 1 L 4 -3 L 4 4" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Left Disconnected Cable & Plug */}
      <g>
        <circle cx="120" cy="242" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" filter="url(#msSoftShadow)" />
        <path d="M 120 242 C 115 258 135 272 152 268" fill="none" stroke="url(#msCordGrad)" strokeWidth="5" strokeLinecap="round" />
        <g transform="translate(152, 268) rotate(15)">
          <rect x="0" y="-8" width="16" height="16" rx="4" fill="url(#msPlugGrad)" />
          <rect x="16" y="-6" width="9" height="3.5" rx="1" fill="#CBD5E1" />
          <rect x="16" y="2.5" width="9" height="3.5" rx="1" fill="#CBD5E1" />
        </g>
      </g>

      {/* Right Disconnected Socket & Cable */}
      <g>
        <circle cx="282" cy="242" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" filter="url(#msSoftShadow)" />
        <path d="M 282 242 C 287 258 267 272 248 268" fill="none" stroke="url(#msCordGrad)" strokeWidth="5" strokeLinecap="round" />
        <g transform="translate(248, 268) rotate(-15)">
          <rect x="-18" y="-9" width="18" height="18" rx="4" fill="url(#msBrandBlueGrad)" />
          <rect x="-3" y="-5.5" width="3" height="3.5" rx="0.5" fill="#0F172A" />
          <rect x="-3" y="2" width="3" height="3.5" rx="0.5" fill="#0F172A" />
        </g>
      </g>

      {/* Disconnect Gap Spark */}
      <g transform="translate(200, 271)">
        <path d="M -2 -9 L 2 -2 L -2 1 L 2 9" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-10" cy="-6" r="1.5" fill="#EF4444" />
        <circle cx="10" cy="6" r="1.5" fill="#3B82F6" />
      </g>

      {/* Floating 3D Wi-Fi Off Badge on Top-Right */}
      <g transform="translate(285, 95)" filter="url(#msPillShadow)">
        <circle cx="0" cy="0" r="30" fill="url(#msAlertRedGrad)" stroke="#FFFFFF" strokeWidth="3.5" />
        <circle cx="0" cy="11" r="2.5" fill="#FFFFFF" />
        <path d="M -7 5 A 10 10 0 0 1 7 5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M -13 -1 A 18 18 0 0 1 13 -1" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M -18 -7 A 26 26 0 0 1 18 -7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-16" y1="-16" x2="16" y2="16" stroke="#FFFFFF" strokeWidth="3.8" strokeLinecap="round" />
        <line x1="-16" y1="-16" x2="16" y2="16" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Floating Signal Status Pill on Left */}
      <g transform="translate(75, 175)" filter="url(#msBadgeShadow)">
        <rect x="-38" y="-14" width="76" height="28" rx="14" fill="#FFFFFF" stroke="#FEE2E2" strokeWidth="1.5" />
        <circle cx="-24" cy="0" r="4.5" fill="#EF4444" />
        <text x="-14" y="4" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10.5" fontWeight="800" fill="#E11D48" letterSpacing="-0.2">OFFLINE</text>
      </g>
    </svg>
  );
}
