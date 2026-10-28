"use client";
import React, { useState, useEffect } from 'react';
import MascotState from './MascotState';
import { WifiOff, RefreshCw, X } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      setShowModal(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowModal(true);
    };

    if (!navigator.onLine) {
      setIsOffline(true);
      setShowModal(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <>
      {/* Subtle top indicator if modal is minimized */}
      {!showModal && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-rose-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>You are currently offline. Check your internet connection.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="underline hover:text-rose-100 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Modal with MarkatVerse Offline Mascot */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Minimize"
            >
              <X className="w-5 h-5" />
            </button>

            <MascotState
              state="no-internet"
              title="No Internet"
              description="Looks like you are offline. Check your internet connection and try again."
              actionText="Retry"
              onAction={() => {
                if (navigator.onLine) {
                  setIsOffline(false);
                  setShowModal(false);
                } else {
                  window.location.reload();
                }
              }}
              secondaryText="Dismiss"
              onSecondaryAction={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
