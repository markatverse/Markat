"use client";
import React from 'react';
import MascotState from '@/components/MascotState';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 w-full max-w-lg">
        <MascotState
          state="404"
          title="404 Not Found"
          description="Oops! This page seems to have gone on a different journey. Let's get you back."
          actionText="Go to Home"
          actionHref="/"
          secondaryText="Explore Categories"
          secondaryHref="/categories"
        />
      </div>
    </div>
  );
}
