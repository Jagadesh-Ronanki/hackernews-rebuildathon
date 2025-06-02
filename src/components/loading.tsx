import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className="p-2 sm:p-3 rounded-lg animate-pulse bg-orange-200/10 backdrop-blur-md dark:bg-orange-900/10 border border-orange-200/30 dark:border-orange-900/20"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 px-1 sm:px-2">
            <div className="hidden md:block w-4 h-4 bg-orange-200 dark:bg-orange-900/30 rounded"></div>
            
            <div className="flex-1 space-y-2">
              <div className="h-4 sm:h-5 bg-orange-200 dark:bg-orange-900/30 rounded-md w-3/4"></div>
              
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(i % 5 === 0 || i % 7 === 0) && (
                  <div className="h-3 sm:h-4 bg-orange-200 dark:bg-orange-900/30 rounded w-12 sm:w-14"></div>
                )}
                {/* Points */}
                <div className="h-2 sm:h-3 bg-orange-200 dark:bg-orange-900/30 rounded w-10 sm:w-12"></div>
                {/* Author */}
                <div className="h-2 sm:h-3 bg-orange-200 dark:bg-orange-900/30 rounded w-16 sm:w-20"></div>
                {/* Time */}
                <div className="h-2 sm:h-3 bg-orange-200 dark:bg-orange-900/30 rounded w-14 sm:w-16"></div>
                {/* Comments */}
                <div className="h-2 sm:h-3 bg-orange-200 dark:bg-orange-900/30 rounded w-12 sm:w-14"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md my-4">
      <p className="text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
