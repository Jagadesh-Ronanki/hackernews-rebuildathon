'use client'

import { useState, useEffect } from 'react'
import { ReadingList } from '@/components/reading-list'
import { hackerNewsService } from '@/api'
import { Story } from '@/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSkeleton } from '@/components/loading'

interface ReadingListCollection {
  id: string;
  name: string;
  storyIds: number[];
  createdAt: number;
}

export default function SavedPage() {
  const [savedStoryIds, setSavedStoryIds] = useState<number[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  // Load saved story IDs from localStorage
  useEffect(() => {
    const loadSavedStories = async () => {
      setIsLoading(true)
      
      try {
        // Get IDs from both saved posts and reading collections
        const savedStoriesString = localStorage.getItem('hn-saved-posts')
        const savedPostIds = savedStoriesString ? JSON.parse(savedStoriesString) : []
        
        // Get reading collections and extract their story IDs
        const collectionsString = localStorage.getItem('hn-reading-collections')
        const collections: ReadingListCollection[] = collectionsString ? JSON.parse(collectionsString) : []
        
        // Extract all story IDs from collections
        const collectionIds = collections.flatMap(collection => collection.storyIds)
        
        // Combine both sources and remove duplicates
        const allIds = Array.from(new Set([...savedPostIds, ...collectionIds]))
        
        if (allIds.length > 0) {
          setSavedStoryIds(allIds)
          
          // Fetch story details for all saved stories
          const storyPromises = allIds.map(id => hackerNewsService.getItem(id))
          const storiesData = await Promise.all(storyPromises)
          
          // Filter out any null results (in case a story was deleted)
          const validStories = storiesData.filter(story => story !== null) as Story[]
          setStories(validStories)
        } else {
          setSavedStoryIds([])
          setStories([])
        }
      } catch (e) {
        console.error('Error loading saved stories', e)
        setSavedStoryIds([])
        setStories([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSavedStories()
  }, [])
  
  const handleRemoveStory = (storyId: number) => {
    // Remove story from saved list
    const updatedIds = savedStoryIds.filter(id => id !== storyId)
    setSavedStoryIds(updatedIds)
    localStorage.setItem('hn-saved-posts', JSON.stringify(updatedIds))
    
    // Update stories state
    setStories(prevStories => prevStories.filter(story => story.id !== storyId))
    
    // Also remove from any collections
    const collectionsString = localStorage.getItem('hn-reading-collections')
    if (collectionsString) {
      try {
        const collections: ReadingListCollection[] = JSON.parse(collectionsString)
        const updatedCollections = collections.map(collection => ({
          ...collection,
          storyIds: collection.storyIds.filter(id => id !== storyId)
        }))
        localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections))
      } catch (e) {
        console.error('Error updating collections', e)
      }
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto py-4 md:py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Saved Stories</h1>
      
      <Tabs defaultValue="reading-lists" className="w-full">
        <TabsList>
          <TabsTrigger value="reading-lists">Reading Lists</TabsTrigger>
          <TabsTrigger value="saved-stories">All Saved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reading-lists" className="mt-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <ReadingList 
              savedStories={stories} 
              onRemoveFromList={handleRemoveStory} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="saved-stories" className="mt-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : stories.length === 0 ? (
            <div className="text-center py-10 bg-orange-200/10 backdrop-blur-md rounded-lg border border-orange-200/50 dark:border-orange-900/30">
              <p className="text-gray-500 dark:text-gray-400">You haven't saved any stories yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map(story => (
                <div 
                  key={story.id} 
                  className="border rounded-lg p-3 bg-orange-200/10 backdrop-blur-md hover:shadow-sm"
                >
                  <a 
                    href={story.url || `/post/${story.id}`} 
                    className="text-lg font-medium hover:text-orange-600 dark:hover:text-orange-400 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {story.title}
                  </a>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {story.score} points | by {story.by} | {story.descendants || 0} comments
                  </div>
                  
                  <button 
                    className="text-sm text-red-500 hover:text-red-700 mt-2"
                    onClick={() => handleRemoveStory(story.id)}
                  >
                    Remove from saved
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
