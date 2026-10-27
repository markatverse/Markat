import React from 'react';

export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div suppressHydrationWarning className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm h-full flex flex-col border border-slate-100">
          {/* Image placeholder */}
          <div className="w-full h-[140px] sm:h-[180px] bg-slate-200 rounded-lg mb-2 sm:mb-3 animate-pulse"></div>
          
          {/* Seller placeholder */}
          <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse mb-2"></div>
          
          {/* Title placeholder */}
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1"></div>
          <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse mb-2"></div>
          
          {/* Category pill placeholder */}
          <div className="h-4 w-1/2 bg-indigo-50 rounded animate-pulse mb-3 mt-1"></div>
          
          {/* Price and bottom row placeholder */}
          <div className="mt-auto">
            <div className="h-5 w-1/3 bg-slate-200 rounded animate-pulse mb-3"></div>
            <div className="flex justify-between items-center mt-2 sm:mt-3">
              <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
