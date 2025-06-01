'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PaginationBar } from '../components/pagination-bar'
import { StoryItem } from '../components/story-item'
import { LoadingSkeleton, ErrorMessage } from '../components/loading'
import { useStories } from '../hooks/use-stories'
import { StoryFilters } from '../components/story-filters'
import { useVoiceControl, PageActions } from '../context/voice-control-context';

function HomeClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [upvotedPosts, setUpvotedPosts] = useState<Set<number>>(new Set())
  const [hiddenPosts, setHiddenPosts] = useState<Set<number>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isMobile, setIsMobile] = useState(false)

  const getInitialStoryType = () => {
    if (searchParams) {
      const typeFromUrl = searchParams.get('type');
      if (typeFromUrl && ['top', 'new', 'best', 'job', 'ask', 'show'].includes(typeFromUrl)) {
        return typeFromUrl as 'top' | 'new' | 'best' | 'job' | 'ask' | 'show';
      }
    }
    if (typeof window !== 'undefined') {
      const savedStoryType = localStorage.getItem('hn-story-type');
      if (savedStoryType && ['top', 'new', 'best', 'job', 'ask', 'show'].includes(savedStoryType)) {
        return savedStoryType as 'top' | 'new' | 'best' | 'job' | 'ask' | 'show';
      }
    }
    return 'top';
  };

  const [storyType, setStoryType] = useState<'top' | 'new' | 'best' | 'job' | 'ask' | 'show'>('top');
  
  // Effect to set initial story type once searchParams is available
  useEffect(() => {
    setStoryType(getInitialStoryType());
  }, [searchParams]);

  const [sortBy, setSortBy] = useState<'default' | 'points' | 'comments' | 'newest' | 'oldest'>('default')
  const [domainFilter, setDomainFilter] = useState('')
  const [keywordFilter, setKeywordFilter] = useState('')
  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'card'>('normal')
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal')
  const { registerPageActions, unregisterPageActions } = useVoiceControl();
  
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem('hn-items-per-page')
    if (savedItemsPerPage) {
      const parsedValue = parseInt(savedItemsPerPage, 10)
      if (!isNaN(parsedValue) && [5, 10, 25, 50].includes(parsedValue)) {
        setItemsPerPage(parsedValue)
      }
    }
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

  const handleSave = (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
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
    localStorage.setItem('hn-items-per-page', newItemsPerPage.toString())
  }
  
  const handleChangeStoryType = (type: 'top' | 'new' | 'best' | 'job' | 'ask' | 'show') => {
    router.push(`/?type=${type}`, { scroll: false });
  }

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

  const visibleStories = stories.filter(story => !hiddenPosts.has(story.id))
  const totalPages = Math.ceil(totalStories / itemsPerPage)

  useEffect(() => {
    const pageActions: PageActions = {
      goToNextPage: () => {
        if (currentPage < totalPages) {
          handlePageChange(currentPage + 1);
        }
      },
      goToPrevPage: () => {
        if (currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
      },
      setItemsPerPage: (count: number) => {
        handleItemsPerPageChange(count);
      },
      searchByKeyword: (keyword: string) => {
        setKeywordFilter(keyword);
      },
      sortByPreference: (sortType: 'default' | 'points' | 'comments' | 'newest' | 'oldest') => {
        setSortBy(sortType);
      },
      setDomainFilter: (domain: string) => {
        setDomainFilter(domain);
      },
      clearDomainFilter: () => {
        setDomainFilter('');
      },
      clearKeywordFilter: () => {
        setKeywordFilter('');
      },
      setViewMode: (mode: 'normal' | 'compact' | 'card') => {
        setViewMode(mode);
      },
      setFontSize: (size: 'small' | 'normal' | 'large') => {
        setFontSize(size);
      },
      clearAllFilters: () => {
        setDomainFilter('');
        setKeywordFilter('');
        // Potentially reset sort to default as well, if desired
        // setSortBy('default'); 
      }
    };
    registerPageActions(pageActions);

    return () => {
      unregisterPageActions();
    };
  }, [currentPage, totalPages, handlePageChange, handleItemsPerPageChange, setKeywordFilter, setSortBy, registerPageActions, unregisterPageActions, setDomainFilter, setViewMode, setFontSize]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

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
      localStorage.setItem('hn-upvoted-posts', JSON.stringify([...newSet]))
      return newSet
    })
  }

  const handleHide = (postId: number) => {
    setHiddenPosts(prev => {
      const newSet = new Set([...prev, postId])
      localStorage.setItem('hn-hidden-posts', JSON.stringify([...newSet]))
      return newSet
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div id="main-scrollable-content" className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-2 md:px-4 md:py-6">
          <main>
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
                    <span className="md:hidden">
                      {type.id === 'ask' ? 'Ask' : type.id === 'show' ? 'Show' : type.label}
                    </span>
                    <span className="hidden md:inline">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

            {error && <ErrorMessage message={error.message} />}
            {isLoading && <LoadingSkeleton />}
            {!isLoading && !error && visibleStories.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No stories available</p>
              </div>
            )}
            {!isLoading && !error && visibleStories.length > 0 && (
              <div 
                className={`
                  ${viewMode === 'normal' ? 'space-y-1 divide-y divide-gray-100 dark:divide-gray-800' : ''}
                  ${viewMode === 'compact' ? 'space-y-0 divide-y divide-gray-100 dark:divide-gray-800' : ''}
                  ${viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : ''}
                `}
                key={`stories-${storyType}-${currentPage}`}
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

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}