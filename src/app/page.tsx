'use client'

import { useState, useEffect } from 'react'
import { PaginationBar } from '../components/pagination-bar'
import { StoryItem } from '../components/story-item'
import { LoadingSkeleton, ErrorMessage } from '../components/loading'
import { useStories } from '../hooks/use-stories'
import { StoryFilters } from '../components/story-filters'

export default function Home() {
  const [upvotedPosts, setUpvotedPosts] = useState<Set<number>>(new Set())
  const [hiddenPosts, setHiddenPosts] = useState<Set<number>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isMobile, setIsMobile] = useState(false)
  const [storyType, setStoryType] = useState<'top' | 'new' | 'best' | 'job' | 'ask' | 'show'>('top')
  
  // Add states for filters and customization options
  const [sortBy, setSortBy] = useState<'default' | 'points' | 'comments' | 'newest' | 'oldest'>('default')
  const [domainFilter, setDomainFilter] = useState('')
  const [keywordFilter, setKeywordFilter] = useState('')
  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'card'>('normal')
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal')
  
  // Load saved preferences from localStorage
  useEffect(() => {
    // Load saved story type preference
    const savedStoryType = localStorage.getItem('hn-story-type')
    if (savedStoryType && ['top', 'new', 'best', 'job', 'ask', 'show'].includes(savedStoryType)) {
      setStoryType(savedStoryType as any)
    }
    
    // Load saved items per page preference
    const savedItemsPerPage = localStorage.getItem('hn-items-per-page')
    if (savedItemsPerPage) {
      const parsedValue = parseInt(savedItemsPerPage, 10)
      if (!isNaN(parsedValue) && [5, 10, 25, 50].includes(parsedValue)) {
        setItemsPerPage(parsedValue)
      }
    }
    
    // Load saved filter preferences
    const savedSortBy = localStorage.getItem('hn-sort-preference')
    if (savedSortBy && ['default', 'points', 'comments', 'newest', 'oldest'].includes(savedSortBy)) {
      setSortBy(savedSortBy as any)
    }
    
    const savedViewMode = localStorage.getItem('hn-view-mode')
    if (savedViewMode && ['normal', 'compact', 'card'].includes(savedViewMode)) {
      setViewMode(savedViewMode as any)
    }
    
    const savedFontSize = localStorage.getItem('hn-font-size')
    if (savedFontSize && ['small', 'normal', 'large'].includes(savedFontSize)) {
      setFontSize(savedFontSize as any)
    }
    
    // Load saved posts
    try {
      const savedPostsString = localStorage.getItem('hn-saved-posts')
      if (savedPostsString) {
        const savedPostsArr = JSON.parse(savedPostsString)
        if (Array.isArray(savedPostsArr)) {
          setSavedPosts(new Set(savedPostsArr))
        }
      }
    } catch (e) {
      console.error('Error loading saved posts', e)
    }
    
    // Load hidden posts
    try {
      const hiddenPostsString = localStorage.getItem('hn-hidden-posts')
      if (hiddenPostsString) {
        const hiddenPostsArr = JSON.parse(hiddenPostsString)
        if (Array.isArray(hiddenPostsArr)) {
          setHiddenPosts(new Set(hiddenPostsArr))
        }
      }
    } catch (e) {
      console.error('Error loading hidden posts', e)
    }
    
    // Load upvoted posts
    try {
      const upvotedPostsString = localStorage.getItem('hn-upvoted-posts')
      if (upvotedPostsString) {
        const upvotedPostsArr = JSON.parse(upvotedPostsString)
        if (Array.isArray(upvotedPostsArr)) {
          setUpvotedPosts(new Set(upvotedPostsArr))
        }
      }
    } catch (e) {
      console.error('Error loading upvoted posts', e)
    }
  }, [])

  const { 
    stories, 
    isLoading, 
    error, 
    totalStories, 
    refetch 
  } = useStories({
    type: storyType,
    limit: 50,
    page: currentPage,
    itemsPerPage,
    sortBy,
    filterDomain: domainFilter,
    filterKeyword: keywordFilter
  })

  // Check if on mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Story type tabs
  const storyTypes = [
    { id: 'top', label: 'Top' },
    { id: 'new', label: 'New' },
    { id: 'best', label: 'Best' },
    { id: 'ask', label: 'Ask HN' },
    { id: 'show', label: 'Show HN' },
    { id: 'job', label: 'Jobs' }
  ]

  const handleUpvote = (postId: number) => {
    setUpvotedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      
      // Save to localStorage
      localStorage.setItem('hn-upvoted-posts', JSON.stringify([...newSet]))
      
      return newSet
    })
  }

  const handleHide = (postId: number) => {
    setHiddenPosts(prev => {
      const newSet = new Set([...prev, postId])
      
      // Save to localStorage
      localStorage.setItem('hn-hidden-posts', JSON.stringify([...newSet]))
      
      return newSet
    })
  }

  const handleSave = (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      
      // Save to localStorage
      localStorage.setItem('hn-saved-posts', JSON.stringify([...newSet]))
      
      return newSet
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    // Save preference to localStorage
    localStorage.setItem('hn-items-per-page', newItemsPerPage.toString())
  }
  
  const handleChangeStoryType = (type: 'top' | 'new' | 'best' | 'job' | 'ask' | 'show') => {
    setStoryType(type)
    setCurrentPage(1)
    // Save preference to localStorage
    localStorage.setItem('hn-story-type', type)
  }

  const visibleStories = stories.filter(story => !hiddenPosts.has(story.id))
  const totalPages = Math.ceil(totalStories / itemsPerPage)

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-2 md:px-4 md:py-6">
          <main>
            {/* Story Type Selector */}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="flex -mb-px min-w-max">
                {storyTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleChangeStoryType(type.id as any)}
                    className={`px-2 md:px-3 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                      storyType === type.id
                        ? 'border-b-2 border-orange-500 text-orange-500'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {/* Simplified labels for mobile */}
                    <span className="md:hidden">
                      {type.id === 'ask' ? 'Ask' : type.id === 'show' ? 'Show' : type.label}
                    </span>
                    <span className="hidden md:inline">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add StoryFilters Component */}
            <StoryFilters
              onSortChange={setSortBy}
              onDomainFilterChange={setDomainFilter}
              onKeywordFilterChange={setKeywordFilter}
              onViewModeChange={setViewMode}
              onFontSizeChange={setFontSize}
              sortBy={sortBy}
              domainFilter={domainFilter}
              keywordFilter={keywordFilter}
              viewMode={viewMode}
              fontSize={fontSize}
            />

            {/* Error State */}
            {error && <ErrorMessage message={error.message} />}
            
            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}
            
            {/* Stories List */}
            {!isLoading && !error && visibleStories.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No stories available</p>
              </div>
            )}
            
            {/* Stories */}
            {!isLoading && !error && visibleStories.length > 0 && (
              <div 
                className={`
                  ${viewMode === 'normal' ? 'space-y-1 divide-y divide-gray-100 dark:divide-gray-800' : ''}
                  ${viewMode === 'compact' ? 'space-y-0 divide-y divide-gray-100 dark:divide-gray-800' : ''}
                  ${viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : ''}
                `}
                key={`stories-${storyType}-${currentPage}`} // Force remount on type or page change for animation
              >
                {visibleStories.map((story, index) => (
                  <StoryItem
                    key={story.id}
                    story={story}
                    index={index + ((currentPage - 1) * itemsPerPage)}
                    isUpvoted={upvotedPosts.has(story.id)}
                    isSaved={savedPosts.has(story.id)}
                    onUpvote={handleUpvote}
                    onSave={handleSave}
                    onHide={handleHide}
                    isMobile={isMobile}
                    viewMode={viewMode}
                    fontSize={fontSize}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Fixed Pagination Bar at Bottom */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalStories}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  )
}