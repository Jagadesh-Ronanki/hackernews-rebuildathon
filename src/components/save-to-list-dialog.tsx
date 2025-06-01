'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BookmarkPlus, Check } from 'lucide-react'

interface SaveToListDialogProps {
  storyId: number;
  storyTitle: string;
  onSaved?: () => void;
}

interface ReadingListCollection {
  id: string;
  name: string;
  storyIds: number[];
  createdAt: number;
}

export function SaveToListDialog({ storyId, storyTitle, onSaved }: SaveToListDialogProps) {
  const [collections, setCollections] = useState<ReadingListCollection[]>([])
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Load collections when dialog opens
  const loadCollections = () => {
    const savedCollections = localStorage.getItem('hn-reading-collections')
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections)
        if (Array.isArray(parsedCollections)) {
          setCollections(parsedCollections)
        }
      } catch (e) {
        console.error('Error loading reading collections', e)
        setCollections([])
      }
    } else {
      setCollections([])
    }
  }
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    loadCollections()
    setSaveSuccess(false)
  }
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setNewCollectionName('')
  }
  
  const createCollection = () => {
    if (!newCollectionName.trim()) return
    
    setInProgress(true)
    
    const newCollection: ReadingListCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName.trim(),
      storyIds: [storyId],
      createdAt: Date.now()
    }
    
    const updatedCollections = [...collections, newCollection]
    setCollections(updatedCollections)
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections))
    
    // Also add to saved posts to ensure it shows up in both places
    const savedPostsStr = localStorage.getItem('hn-saved-posts')
    const savedPosts = savedPostsStr ? JSON.parse(savedPostsStr) : []
    if (!savedPosts.includes(storyId)) {
      savedPosts.push(storyId)
      localStorage.setItem('hn-saved-posts', JSON.stringify(savedPosts))
    }
    
    setNewCollectionName('')
    setSaveSuccess(true)
    setInProgress(false)
    
    if (onSaved) {
      onSaved()
    }
  }
  
  const addToCollection = (collectionId: string) => {
    setInProgress(true)
    
    const updatedCollections = collections.map(c => {
      if (c.id === collectionId && !c.storyIds.includes(storyId)) {
        return { ...c, storyIds: [...c.storyIds, storyId] }
      }
      return c
    })
    
    setCollections(updatedCollections)
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections))
    
    // Also add to saved posts to ensure it shows up in both places
    const savedPostsStr = localStorage.getItem('hn-saved-posts')
    const savedPosts = savedPostsStr ? JSON.parse(savedPostsStr) : []
    if (!savedPosts.includes(storyId)) {
      savedPosts.push(storyId)
      localStorage.setItem('hn-saved-posts', JSON.stringify(savedPosts))
    }
    
    setSaveSuccess(true)
    setInProgress(false)
    
    if (onSaved) {
      onSaved()
    }
  }
  
  const removeFromCollection = (collectionId: string) => {
    setInProgress(true)
    
    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, storyIds: c.storyIds.filter(id => id !== storyId) }
      }
      return c
    })
    
    setCollections(updatedCollections)
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections))
    setInProgress(false)
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleOpenDialog}
          className="h-7 px-1.5 py-0 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          title="Save to reading list"
        >
          <BookmarkPlus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Reading List</DialogTitle>
          <DialogDescription>
            Add this story to one of your reading lists or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {saveSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-2 rounded-md flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Successfully saved to reading list</span>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-2">Story</h4>
            <div className="text-sm p-2 bg-orange-50/80 dark:bg-orange-900/10 rounded-md">
              {storyTitle}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select a reading list</h4>
            
            {collections.length === 0 ? (
              <p className="text-sm text-gray-500">No reading lists yet. Create one below.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collections.map(collection => {
                  const isInCollection = collection.storyIds.includes(storyId)
                  return (
                    <button
                      key={collection.id}
                      onClick={() => isInCollection 
                        ? removeFromCollection(collection.id) 
                        : addToCollection(collection.id)
                      }
                      disabled={inProgress}
                      className={`w-full flex items-center justify-between p-2 text-sm text-left rounded-md transition-colors ${
                        isInCollection 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{collection.name}</span>
                      {isInCollection && <Check className="w-4 h-4" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Create new reading list</h4>
            <div className="flex gap-2">
              <Input 
                placeholder="New list name" 
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                className="h-9"
              />
              <Button 
                onClick={createCollection}
                disabled={!newCollectionName.trim() || inProgress}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
