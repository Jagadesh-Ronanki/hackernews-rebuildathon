'use client'

import { useState } from 'react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

export function PaginationBar({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: PaginationBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const itemsPerPageOptions = [10, 20, 50, 100]
  
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }
    }

    return rangeWithDots
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 sm:relative sm:bg-transparent sm:border-0 sm:z-auto z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-14">
          {/* Desktop Pagination */}
          <div className="hidden md:flex items-center justify-between w-full gap-x-4 lg:gap-x-6">
            {/* Section 1 - Page Info */}
            <div className="flex items-center space-x-6 px-3 py-2 rounded-md bg-orange-50/80 dark:bg-orange-900/10 backdrop-blur-md border border-orange-200/70 dark:border-orange-800/30">
              <span className="font-mono text-[10px] sm:text-xs md:text-sm text-orange-700 dark:text-orange-400">
                Showing {startItem}-{endItem} of {totalItems}
              </span>
            </div>

            {/* Section 2 - Page Numbers */}
            <div className="flex items-center space-x-1 px-3 py-2 rounded-md bg-orange-50/80 dark:bg-orange-900/10 backdrop-blur-md border border-orange-200/70 dark:border-orange-800/30">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 md:px-3 py-1 font-mono text-[10px] sm:text-xs md:text-sm text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                PREV
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {getVisiblePages().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="px-2 py-1 font-mono text-[10px] sm:text-xs md:text-sm text-orange-400 dark:text-orange-600">...</span>
                    ) : (
                      <button
                        onClick={() => onPageChange(page as number)}
                        className={`px-2 md:px-3 py-1 font-mono text-[10px] sm:text-xs md:text-sm rounded transition-colors ${
                          currentPage === page
                            ? 'bg-orange-500 text-white dark:bg-orange-600 dark:text-white'
                            : 'text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-800 dark:hover:text-orange-300'
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 md:px-3 py-1 font-mono text-[10px] sm:text-xs md:text-sm text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                NEXT
              </button>
            </div>

            {/* Section 3 - Items Per Page */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors relative">
              <span className="font-mono text-[10px] sm:text-xs md:text-sm text-white">
                PER PAGE:
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 font-mono text-[10px] sm:text-xs md:text-sm text-white hover:text-orange-100 transition-colors"
                  aria-label={`${itemsPerPage} items per page`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="font-medium">{itemsPerPage}</span>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 py-1 bg-orange-100 backdrop-blur-md border border-orange-200 dark:border-orange-800 rounded-md shadow-lg shadow-orange-500/10 z-50"
                    role="listbox"
                  >
                    {itemsPerPageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          onItemsPerPageChange(option)
                          setIsDropdownOpen(false)
                        }}
                        className={`block w-full px-3 py-1.5 text-left font-mono text-[10px] sm:text-xs md:text-sm transition-colors ${
                          itemsPerPage === option
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-700 dark:hover:text-orange-400'
                        }`}
                        role="option"
                        aria-selected={itemsPerPage === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="md:hidden flex items-center justify-between w-full pb-14 sm:pb-0">
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-orange-50/80 dark:bg-orange-900/10 backdrop-blur-md border border-orange-200/70 dark:border-orange-800/30">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="font-mono text-[10px] sm:text-xs text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                PREV
              </button>
              
              <span className="font-mono text-[10px] sm:text-xs font-medium text-orange-700 dark:text-orange-400">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="font-mono text-[10px] sm:text-xs text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                NEXT
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 px-2 py-1.5 font-mono text-[10px] sm:text-xs text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 rounded-md transition-colors"
                aria-label={`${itemsPerPage} items per page`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <span className="font-medium">{itemsPerPage}</span>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div 
                  className="absolute bottom-full right-0 mb-2 py-1 bg-orange-200/10 backdrop-blur-md border border-orange-200 dark:border-orange-800 rounded-md shadow-lg shadow-orange-500/10 z-50"
                  role="listbox"
                >
                  {itemsPerPageOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onItemsPerPageChange(option)
                        setIsDropdownOpen(false)
                      }}
                      className={`block w-full px-3 py-1.5 text-left font-mono text-[10px] sm:text-xs transition-colors ${
                        itemsPerPage === option
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-700 dark:hover:text-orange-400'
                      }`}
                      role="option"
                      aria-selected={itemsPerPage === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}