'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiEdit3, FiUser } from 'react-icons/fi'
import { useUser } from '../../../hooks/use-user'
import { LoadingSkeleton, ErrorMessage } from '../../../components/loading'
import { formatTimeAgo } from '../../../api/utils/helpers'

export default function UserProfilePage() {
  const { username } = useParams()
  const { user, submissions, isLoading, error } = useUser(username as string, 30)
  const [activeTab, setActiveTab] = useState<'about' | 'submissions'>('about')
  
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage message={error.message} />
  if (!user) return <ErrorMessage message="User not found" />
  
  const created = user.created ? formatTimeAgo(user.created) : ''
  
  // Group submissions by type
  const stories = submissions.filter(item => item.type === 'story')
  const comments = submissions.filter(item => item.type === 'comment')
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* User header */}
      <div className="bg-orange-200/10 backdrop-blur-md rounded-lg shadow-sm p-6 mb-6 border border-orange-200/30 dark:border-orange-900/20">
        <div className="flex items-start">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3 mr-4">
            <FiUser size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.id}
            </h1>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiClock className="mr-2" />
                Member for {created}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiEdit3 className="mr-2" />
                {user.karma} karma
              </div>
            </div>
            
            {user.about && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                <h2 className="font-medium text-gray-900 dark:text-gray-100 mb-2">About</h2>
                <div 
                  className="prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: user.about }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content tabs */}
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex -mb-px">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'about'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              About
            </button>
            
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>
        </div>
        
        {/* About tab */}
        {activeTab === 'about' && (
          <div>
            <div className="bg-orange-200/10 backdrop-blur-md rounded-lg shadow-sm p-6 mb-6 border border-orange-200/30 dark:border-orange-900/20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Activity Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-200/10 backdrop-blur-md dark:bg-orange-900/10 p-4 rounded-md border border-orange-200/30 dark:border-orange-900/20">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Karma</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.karma}</p>
                </div>
                
                <div className="bg-orange-200/10 backdrop-blur-md dark:bg-orange-900/10 p-4 rounded-md border border-orange-200/30 dark:border-orange-900/20">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stories</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stories.length}</p>
                </div>
                
                <div className="bg-orange-200/10 backdrop-blur-md dark:bg-orange-900/10 p-4 rounded-md border border-orange-200/30 dark:border-orange-900/20">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Comments</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{comments.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Submissions tab */}
        {activeTab === 'submissions' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Stories by {user.id}
              </h2>
              
              {stories.length > 0 ? (
                <div className="space-y-2 mb-6">
                  {stories.map(story => (
                    <div 
                      key={story.id}
                      className="bg-orange-200/10 backdrop-blur-md border border-orange-200/30 dark:border-orange-900/20 rounded-md p-4"
                    >
                      <Link 
                        href={`/post/${story.id}`}
                        className="text-base font-medium text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        {story.title}
                      </Link>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
                        <span>{story.score || 0} points</span>
                        <span>{story.descendants || 0} comments</span>
                        <span>{story.time ? formatTimeAgo(story.time) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-orange-200/10 backdrop-blur-md border border-orange-200/30 dark:border-orange-900/20 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No stories posted yet.</p>
                </div>
              )}
              
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-8">
                Comments by {user.id}
              </h2>
              
              {comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map(comment => (
                    <div 
                      key={comment.id}
                      className="bg-orange-200/10 backdrop-blur-md border border-orange-200/30 dark:border-orange-900/20 rounded-md p-4"
                    >
                      <div
                        className="prose-sm dark:prose-invert max-w-none mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: comment.text || '' }}
                      />
                      
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {comment.time ? formatTimeAgo(comment.time) : ''}
                        </span>
                        
                        <Link 
                          href={`/post/${comment.parent}`}
                          className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          View thread
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-orange-200/10 backdrop-blur-md border border-orange-200/30 dark:border-orange-900/20 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No comments posted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
