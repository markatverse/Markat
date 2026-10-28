"use client";
import React, { useEffect } from 'react';
import MascotState from '@/components/MascotState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 w-full max-w-lg">
        <MascotState
          state="server-error"
          title="Server Error"
          description="Something went wrong on our side. Our team is already on it. Please try again later."
          actionText="Try Again"
          onAction={reset}
          secondaryText="Go to Home"
          secondaryHref="/"
        />
      </div>
    </div>
  );
}
