'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StoryItem } from '../../components/story-item'
import { LoadingSkeleton, ErrorMessage } from '../../components/loading'
import { useSearch } from '../../hooks/use-search'
import { Story } from '@/api'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  const [isMobile, setIsMobile] = useState(false)

  const { 
    searchResults, 
    isLoading, 
    error, 
    search, 
    totalResults 
  } = useSearch({ initialQuery: query })

  // Check if on mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Reload search results if query changes
  // Note: initial search is now handled in the useSearch hook

  return (
    <div className="max-w-7xl mx-auto py-2 md:px-4 md:py-6">
      <main>
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="font-mono text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Search Results
          </h1>
          <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1">
            {query ? (
              <>
                {totalResults} {totalResults === 1 ? 'result' : 'results'} for <span className="font-semibold">"{query}"</span>
              </>
            ) : (
              'Please enter a search query'
            )}
          </p>
        </div>

        {/* Error State */}
        {error && <ErrorMessage message={error.message} />}
        
        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}
        
        {/* Empty Search State */}
        {!isLoading && !error && query && searchResults.length === 0 && (
          <div className="text-center py-10">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try using different keywords or searching for a topic
              </p>
            </div>
          </div>
        )}
        
        {/* Empty Query State */}
        {!isLoading && !error && !query && (
          <div className="text-center py-10">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Enter a search term</p>
            </div>
          </div>
        )}
        
        {/* Search Results */}
        {!isLoading && !error && searchResults.length > 0 && (
          <div 
            className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800"
            key={`search-results-${query}`}
          >
            {searchResults
            .filter((item): item is Story => item.type === 'story')
            .map((item, index) => (
                <StoryItem
                key={item.id}
                story={item}
                index={index}
                isUpvoted={false}
                isSaved={false}
                onUpvote={() => {}}
                onSave={() => {}}
                onHide={() => {}}
                isMobile={isMobile}
                />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SearchPageContent />
    </Suspense>
  )
}
