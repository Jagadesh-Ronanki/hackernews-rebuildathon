import React from 'react';
import Link from 'next/link';
import { Story } from '../api';
import { extractDomain, formatTimeAgo, extractTopics } from '../api/utils/helpers';
import { StoryActions } from './story-actions';

interface StoryItemProps {
  story: Story;
  index: number;
  isUpvoted: boolean;
  isSaved: boolean;
  onUpvote: (id: number) => void;
  onSave: (id: number) => void;
  onHide: (id: number) => void;
  isMobile: boolean;
  disableVoting?: boolean;
  viewMode?: 'normal' | 'compact' | 'card';
  fontSize?: 'small' | 'normal' | 'large';
}

export function StoryItem({
  story,
  index,
  isUpvoted,
  isSaved,
  onUpvote,
  onSave,
  onHide,
  isMobile,
  disableVoting = false,
  viewMode = 'normal',
  fontSize = 'normal'
}: StoryItemProps) {
  const domain = story.url ? extractDomain(story.url) : '';
  const timeAgo = story.time ? formatTimeAgo(story.time) : '';
  
  // Font size classes
  const fontSizeClasses = {
    title: {
      small: 'text-xs sm:text-sm',
      normal: 'text-sm sm:text-base',
      large: 'text-base sm:text-lg'
    },
    meta: {
      small: 'text-xs sm:text-xs',
      normal: 'text-xs sm:text-sm',
      large: 'text-sm sm:text-base'
    }
  };
  
  // View mode classes
  const viewModeClasses = {
    container: {
      normal: 'p-2 sm:p-3 rounded-lg hover:bg-orange-200/20 hover:backdrop-blur-md dark:hover:bg-orange-900/20 transition-all',
      compact: 'p-1 sm:p-2 hover:bg-orange-200/20 hover:backdrop-blur-md dark:hover:bg-orange-900/20 transition-all',
      card: 'p-3 sm:p-4 md:p-5 bg-orange-50/80 dark:bg-black/40 rounded-2xl border border-orange-200 dark:border-orange-900/30 shadow-lg hover:shadow-xl hover:scale-[1.015] transition-all duration-200 ease-in-out backdrop-blur-md dark:hover:bg-orange-700/30 dark:hover:bg-blur-lg h-full flex-grow'
    }
  };
  
  return (
    <article
      className={`flex ${viewMode === 'card' ? 'flex-col justify-between' : 'flex-row items-center py-4 px-3'} ${viewModeClasses.container[viewMode]} animate-fadeIn ${viewMode === 'card' ? 'overflow-hidden' : ''} max-sm:rounded-xl max-sm:p-2 max-sm:mb-3`}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-labelledby={`post-title-${story.id}`}
    >
      {/* Content Section */}
      <div className={`flex-1 min-w-0 ${viewMode === 'card' ? '' : 'pr-2'}`}>
        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 px-1 sm:px-2 max-sm:space-x-1">
          {/* Post Number */}
          {viewMode !== 'card' && <span 
            className={`hidden md:flex font-mono ${fontSizeClasses.meta[fontSize]} text-orange-500 dark:text-orange-400 min-w-[1rem] text-right`}
            aria-label={`Post number ${index + 1}`}
          >
            {index + 1}.
          </span>}
          <div className="flex-1 min-w-0">
            {/* Title and URL */}
            <div className={`${viewMode === 'card' ? 'flex flex-col' : 'flex flex-col md:flex-row md:items-baseline md:space-x-2 gap-y-1'} mb-1`}>
              <h2 
                id={`post-title-${story.id}`}
                className={`${fontSizeClasses.title[fontSize]} font-semibold text-gray-900 dark:text-gray-100 break-words transition-colors max-sm:text-[16px] max-sm:mb-0.5`}
              >
                {story.url ? (
                  <a 
                    href={story.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    {story.title}
                  </a>
                ) : (
                  <Link 
                    href={`/post/${story.id}`}
                    className="hover:underline hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    {story.title}
                  </Link>
                )}
              </h2>
              {domain && (
                <span className={`${fontSizeClasses.meta[fontSize]} text-gray-500 dark:text-gray-400 ${viewMode === 'card' ? 'w-full mt-1' : 'truncate'} transition-colors max-sm:block max-sm:mt-0.5`}>
                  ({domain})
                </span>
              )}
            </div>
            {/* Meta Information */}
            <div className={`flex items-center flex-wrap ${viewMode === 'card' ? 'gap-1 md:gap-2' : 'gap-2 md:gap-4'} ${fontSizeClasses.meta[fontSize]} text-gray-500 dark:text-gray-400 font-mono max-sm:pt-1 max-sm:text-xs max-sm:gap-1 max-sm:gap-x-3`}>
              {story.title?.startsWith('Ask HN:') && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded text-xs md:text-xs font-medium">
                  Ask HN
                </span>
              )}
              {story.title?.startsWith('Show HN:') && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs md:text-xs font-medium">
                  Show HN
                </span>
              )}
              {(story.title || story.text) && extractTopics(story.title || '', story.text || '').slice(0, 2).map(topic => (
                <span 
                  key={topic}
                  className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-1.5 py-0.5 rounded text-xs md:text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
              <span aria-label={`${story.score || 0} points`}>
                {story.score || 0} {isMobile ? 'pts' : 'points'}
              </span>
              <span className="inline-block" aria-label={`Posted by ${story.by || 'unknown'}`}>by <Link href={`/user/${story.by}`} className="hover:underline hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:underline">{story.by || 'unknown'}</Link></span>
              <span aria-label={`Posted ${timeAgo}`}>{timeAgo}</span>
              <span aria-label={`${story.descendants || 0} comments`}>
                <Link href={`/post/${story.id}`} className="hover:underline hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:underline">
                  {story.descendants || 0} {isMobile ? 'cmts' : 'comments'}
                </Link>
              </span>
            </div>
          </div>
        </div>
        {/* Mobile: Actions at bottom */}
        <div className={`flex sm:hidden mt-2 ${viewMode === 'card' ? 'border-t pt-2 mx-2' : 'justify-end border-y border-gray-100/80 pl-2'} max-sm:justify-between max-sm:space-x-2`}>
          <StoryActions 
            story={story}
            isUpvoted={isUpvoted}
            onUpvote={onUpvote}
            onHide={onHide}
            isMobile={isMobile}
            disableVoting={disableVoting}
            viewMode={viewMode}
          />
        </div>
      </div>
      {/* Desktop: Actions for non-card mode or bottom for card mode */}
      <div className={`hidden sm:flex flex-shrink-0 items-center ${viewMode === 'card' ? 'w-full justify-end border-t border-orange-200/40 dark:border-orange-900/40 pt-3 mt-3' : 'h-full pl-2'}`}>
        <StoryActions 
          story={story}
          isUpvoted={isUpvoted}
          onUpvote={onUpvote}
          onHide={onHide}
          isMobile={isMobile}
          disableVoting={disableVoting}
          viewMode={viewMode}
        />
      </div>
    </article>
  );
}
