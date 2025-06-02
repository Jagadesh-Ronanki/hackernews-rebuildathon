'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FiArrowLeft, FiArrowUp, FiBookmark, FiShare2, FiExternalLink } from 'react-icons/fi'
import { useStory } from '../../../hooks/use-story'
import { Comment } from '../../../api'
import { LoadingSkeleton, ErrorMessage } from '../../../components/loading'
import { extractDomain, formatTimeAgo } from '../../../api/utils/helpers'
import DynamicCommentItem from '../../../components/dynamic-comment-item'
import LoadMoreTrigger from '../../../components/load-more-trigger'
import CommentSummary from '../../../components/comment-summary';

export default function StoryPage() {
  const params = useParams()
  const id = params?.id
  const storyId = parseInt(id as string, 10)
  const { 
    story, 
    comments, 
    isLoading, 
    isLoadingMore,
    error, 
    loadMoreComments, 
    hasMoreComments,
    loadCommentReplies
  } = useStory(storyId)
  
  const [upvoted, setUpvoted] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const toggleUpvote = () => setUpvoted(prev => !prev)
  const toggleSave = () => setSaved(prev => !prev)
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <div className="h-4 w-24 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <div className="h-6 sm:h-8 w-3/4 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse mb-3"></div>
          <div className="h-4 w-1/3 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse mb-6"></div>
          
          <div className="flex space-x-2 mb-4">
            <div className="h-4 w-16 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
          </div>
          
          <div className="space-y-2 py-4">
            <div className="h-3 w-full bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
            <div className="h-3 w-5/6 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
            <div className="h-3 w-4/6 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 py-2 mb-4 sm:mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 sm:h-8 w-20 sm:w-24 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse"></div>
          ))}
        </div>
        
        <div>
          <div className="h-6 w-32 bg-orange-200 dark:bg-orange-900/30 rounded animate-pulse mb-4 sm:mb-6"></div>
          
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-orange-50/50 dark:bg-orange-900/10 rounded-md p-3 sm:p-4 animate-pulse">
                <div className="h-4 w-1/4 bg-orange-200 dark:bg-orange-900/30 rounded mb-3 sm:mb-4"></div>
                <div className="space-y-2">
                  <div className="h-2 sm:h-3 w-full bg-orange-200 dark:bg-orange-900/30 rounded"></div>
                  <div className="h-2 sm:h-3 w-5/6 bg-orange-200 dark:bg-orange-900/30 rounded"></div>
                  <div className="h-2 sm:h-3 w-4/6 bg-orange-200 dark:bg-orange-900/30 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return <ErrorMessage message={error.message} />
  if (!story) return <ErrorMessage message="Story not found" />
  
  const domain = story.url ? extractDomain(story.url) : null
  const timeAgo = story.time ? formatTimeAgo(story.time) : ''
  const commentsForSummary = comments.map(comment => ({ text: comment.text || '' }));

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* Story header */}
      <div className="mb-4 sm:mb-6">
        {/* Special tags for Ask HN or Show HN */}
        {(story.title?.startsWith('Ask HN:') || story.title?.startsWith('Show HN:')) && (
          <div className="mb-2">
            {story.title?.startsWith('Ask HN:') && (
              <span className="bg-orange-100/70 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                Ask HN
              </span>
            )}
            {story.title?.startsWith('Show HN:') && (
              <span className="bg-orange-100/70 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                Show HN
              </span>
            )}
          </div>
        )}
        
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {story.title}
        </h1>
        
        {story.url && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <a 
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {domain} <FiExternalLink className="ml-1" size={14} />
            </a>
          </div>
        )}
        
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 gap-x-3 gap-y-1">
          <span>{story.score} points</span>
          <span>by <Link href={`/user/${story.by}`} className="hover:underline hover:text-orange-600 dark:hover:text-orange-400">{story.by}</Link></span>
          <span>{timeAgo}</span>
          <span>{story.descendants} comments</span>
        </div>
        
        {/* Story text if any */}
        {story.text && (
          <div 
            className="prose dark:prose-invert max-w-none mt-4 pb-4 border-b border-gray-200 dark:border-gray-700"
            dangerouslySetInnerHTML={{ __html: story.text }}
          />
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleUpvote}
          className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            upvoted 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/10 dark:text-orange-300 dark:hover:bg-orange-900/20'
          }`}
        >
          <FiArrowUp className={`mr-1 sm:mr-1.5 ${upvoted ? 'text-orange-600' : ''}`} />
          {upvoted ? 'Upvoted' : 'Upvote'}
        </button>
        
        <button
          onClick={toggleSave}
          className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            saved 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/10 dark:text-orange-300 dark:hover:bg-orange-900/20'
          }`}
        >
          <FiBookmark className={`mr-1 sm:mr-1.5 ${saved ? 'text-orange-600' : ''}`} />
          {saved ? 'Saved' : 'Save'}
        </button>
        
        <button
          onClick={() => navigator.share?.({ 
            title: story.title,
            url: window.location.href 
          }).catch(() => {})}
          className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/10 dark:text-orange-300 dark:hover:bg-orange-900/20 transition-colors"
        >
          <FiShare2 className="mr-1 sm:mr-1.5" />
          Share
        </button>
      </div>
      
      {/* Comments section */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-orange-700 dark:text-orange-400 mb-3 sm:mb-4">
          Comments ({story.descendants || 0})
        </h2>

        {/* Comment Summary Component */}
        {story.descendants && story.descendants > 0 && (
          <CommentSummary storyId={storyId} comments={commentsForSummary} />
        )}
        
        {comments.length === 0 && !isLoading ? (
          <div className="text-center py-6 sm:py-10 border border-orange-200 dark:border-orange-900/30 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
            {story.title?.startsWith('Ask HN:') ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">No comments yet. Be the first to respond!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ask HN posts are meant for community discussion.</p>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No comments yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {comments.map(comment => (
              <DynamicCommentItem
                key={comment.id}
                comment={comment}
                loadReplies={loadCommentReplies}
              />
            ))}
            
            {hasMoreComments && (
              <LoadMoreTrigger 
                onIntersect={loadMoreComments} 
                enabled={!isLoadingMore}
              >
                <div className="py-3 sm:py-4 text-center">
                  {isLoadingMore ? (
                    <div className="inline-block h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-orange-500"></div>
                  ) : (
                    <button 
                      onClick={() => loadMoreComments()} 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/40 rounded-md text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300 transition-colors"
                    >
                      Load more comments
                    </button>
                  )}
                </div>
              </LoadMoreTrigger>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// The old CommentItem component has been replaced by the dynamic version in its own file
