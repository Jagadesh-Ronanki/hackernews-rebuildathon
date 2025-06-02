'use client'

import { useState, useEffect } from 'react'
import { PaginationBar } from '../../components/pagination-bar'
import { StoryItem } from '../../components/story-item'
import { LoadingSkeleton, ErrorMessage } from '../../components/loading'
import { useStories } from '../../hooks/use-stories'

export default function JobsPage() {
  const [hiddenPosts, setHiddenPosts] = useState<Set<number>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isMobile, setIsMobile] = useState(false)

  // Use the stories hook with type set to 'job'
  const { 
    stories, 
    isLoading, 
    error, 
    totalStories, 
    refetch 
  } = useStories({
    type: 'job', // Specifically load job stories
    limit: 50,
    page: currentPage,
    itemsPerPage
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

  // Job posts don't have upvotes, but we keep the handling for saving/hiding
  const handleHide = (postId: number) => {
    setHiddenPosts(prev => new Set([...prev, postId]))
  }

  const handleSave = (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
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

  const visibleStories = stories.filter(story => !hiddenPosts.has(story.id))
  const totalPages = Math.ceil(totalStories / itemsPerPage)

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-2 md:px-4 md:py-6">
          <main>
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="font-mono text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Jobs
              </h1>
              <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1">
                Job opportunities for hackers and the tech community
              </p>
            </div>

            {/* Error State */}
            {error && <ErrorMessage message={error.message} />}
            
            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}
            
            {/* Empty State */}
            {!isLoading && !error && visibleStories.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No job listings available</p>
              </div>
            )}
            
            {/* Jobs */}
            {!isLoading && !error && visibleStories.length > 0 && (
              <div 
                className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800"
                key={`stories-jobs-${currentPage}`}
              >
                {visibleStories.map((story, index) => (
                  <StoryItem
                    key={story.id}
                    story={story}
                    index={index + ((currentPage - 1) * itemsPerPage)}
                    isUpvoted={false}
                    isSaved={savedPosts.has(story.id)}
                    onUpvote={() => {}}
                    onSave={handleSave}
                    onHide={handleHide}
                    isMobile={isMobile}
                    disableVoting={true} 
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
