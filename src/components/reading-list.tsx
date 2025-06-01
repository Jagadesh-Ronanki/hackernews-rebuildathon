'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  BookOpen,
  BookmarkPlus,
  Plus,
  X,
  Check,
  Edit,
  Trash2
} from 'lucide-react'
import { Story } from '../api'

interface ReadingListProps {
  savedStories: Story[];
  onRemoveFromList: (storyId: number) => void;
}

interface ReadingListCollection {
  id: string;
  name: string;
  storyIds: number[];
  createdAt: number;
}

export function ReadingList({ savedStories, onRemoveFromList }: ReadingListProps) {
  const [collections, setCollections] = useState<ReadingListCollection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollection, setEditingCollection] = useState<ReadingListCollection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  // Load collections from localStorage
  useEffect(() => {
    const savedCollections = localStorage.getItem('hn-reading-collections');
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections);
        if (Array.isArray(parsedCollections)) {
          setCollections(parsedCollections);
        }
      } catch (e) {
        console.error('Error loading reading collections', e);
      }
    }
  }, []);
  
  const saveCollections = (updatedCollections: ReadingListCollection[]) => {
    setCollections(updatedCollections);
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections));
  };
  
  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection: ReadingListCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName.trim(),
      storyIds: [],
      createdAt: Date.now()
    };
    
    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);
    setNewCollectionName('');
  };
  
  const updateCollection = (collection: ReadingListCollection) => {
    if (!editingCollection) return;
    
    const updatedCollections = collections.map(c => 
      c.id === editingCollection.id ? { ...c, name: collection.name } : c
    );
    
    saveCollections(updatedCollections);
    setEditingCollection(null);
  };
  
  const deleteCollection = (collectionId: string) => {
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    saveCollections(updatedCollections);
    if (selectedCollection === collectionId) {
      setSelectedCollection(null);
    }
  };
  
  const addToCollection = (collectionId: string, storyId: number) => {
    const updatedCollections = collections.map(c => {
      if (c.id === collectionId && !c.storyIds.includes(storyId)) {
        return { ...c, storyIds: [...c.storyIds, storyId] };
      }
      return c;
    });
    
    saveCollections(updatedCollections);
  };
  
  const removeFromCollection = (collectionId: string, storyId: number) => {
    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, storyIds: c.storyIds.filter(id => id !== storyId) };
      }
      return c;
    });
    
    saveCollections(updatedCollections);
  };
  
  const activeCollection = selectedCollection 
    ? collections.find(c => c.id === selectedCollection) 
    : null;
  
  const collectionStories = activeCollection
    ? savedStories.filter(story => activeCollection.storyIds.includes(story.id))
    : savedStories;
    
  return (
    <div className="border rounded-lg shadow-sm bg-orange-200/10 backdrop-blur-md">
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="font-medium flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Reading Lists
        </h2>
        
        <div className="flex gap-2">
          {/* Collection Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {selectedCollection 
                  ? collections.find(c => c.id === selectedCollection)?.name || 'All Saved'
                  : 'All Saved'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="space-y-1 p-2">
                <button
                  className={`w-full px-2 py-1 text-left rounded-md ${
                    selectedCollection === null 
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedCollection(null)}
                >
                  All Saved Stories
                </button>
                
                {collections.map(collection => (
                  <div key={collection.id} className="flex items-center justify-between">
                    <button
                      className={`flex-1 px-2 py-1 text-left rounded-md ${
                        selectedCollection === collection.id
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedCollection(collection.id)}
                    >
                      {collection.name} ({collection.storyIds.length})
                    </button>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingCollection(collection)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => deleteCollection(collection.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 mt-2 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="New list name" 
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={createCollection}
                      disabled={!newCollectionName.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Collection Stories */}
      <div className="divide-y">
        {collectionStories.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No stories saved {activeCollection ? 'in this list' : 'yet'}
          </div>
        ) : (
          collectionStories.map((story: Story) => (
            <div key={story.id} className="p-3 flex justify-between hover:bg-orange-200/20 dark:hover:bg-orange-900/20">
              <div className="flex-1">
                <a 
                  href={story.url || `/post/${story.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium hover:underline"
                >
                  {story.title}
                </a>
                <div className="text-xs text-gray-500 mt-1">
                  {story.score} points by {story.by}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Add to collection button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="end">
                    <div className="p-2 space-y-1">
                      {collections.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No collections yet. Create one to organize your stories.
                        </div>
                      ) : (
                        collections.map(collection => {
                          const isInCollection = collection.storyIds.includes(story.id);
                          return (
                            <button
                              key={collection.id}
                              className={`w-full flex items-center justify-between px-2 py-1 text-left rounded-md ${
                                isInCollection 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => isInCollection 
                                ? removeFromCollection(collection.id, story.id)
                                : addToCollection(collection.id, story.id)
                              }
                            >
                              <span>{collection.name}</span>
                              {isInCollection && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Remove from saved stories */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onRemoveFromList(story.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Edit Collection Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your reading list collection name
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input 
                value={editingCollection?.name || ''}
                onChange={e => setEditingCollection(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
                placeholder="Collection name"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setEditingCollection(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => updateCollection(editingCollection!)}
                disabled={!editingCollection?.name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
