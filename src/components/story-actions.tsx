'use client'

import React from 'react';
import Link from 'next/link';
import { FiArrowUp, FiEyeOff } from 'react-icons/fi';
import { BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { Story } from '@/api';

interface ReadingListCollection {
  id: string;
  name: string;
  storyIds: number[];
  createdAt: number;
}

interface StoryActionsProps {
  story: Story;
  isUpvoted: boolean;
  onUpvote: (id: number) => void;
  onHide: (id: number) => void;
  isMobile: boolean;
  disableVoting?: boolean;
  viewMode?: 'normal' | 'compact' | 'card';
}

export function StoryActions({
  story,
  isUpvoted,
  onUpvote,
  onHide,
  isMobile,
  disableVoting = false,
  viewMode = 'normal'
}: StoryActionsProps) {
  const [collections, setCollections] = React.useState<ReadingListCollection[]>([]);
  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Load collections when dialog opens
  const loadCollections = () => {
    const savedCollections = localStorage.getItem('hn-reading-collections');
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections);
        if (Array.isArray(parsedCollections)) {
          setCollections(parsedCollections);
        }
      } catch (e) {
        console.error('Error loading reading collections', e);
        setCollections([]);
      }
    } else {
      setCollections([]);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    loadCollections();
    setSaveSuccess(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewCollectionName('');
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    setInProgress(true);

    const newCollection: ReadingListCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName.trim(),
      storyIds: [story.id],
      createdAt: Date.now()
    };

    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections));
    setNewCollectionName('');
    setSaveSuccess(true);
    setInProgress(false);
  };

  const addToCollection = (collectionId: string) => {
    setInProgress(true);

    const updatedCollections = collections.map(c => {
      if (c.id === collectionId && !c.storyIds.includes(story.id)) {
        return { ...c, storyIds: [...c.storyIds, story.id] };
      }
      return c;
    });

    setCollections(updatedCollections);
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections));
    setSaveSuccess(true);
    setInProgress(false);
  };

  const removeFromCollection = (collectionId: string) => {
    setInProgress(true);

    const updatedCollections = collections.map(c => {
      if (c.id === collectionId) {
        return { ...c, storyIds: c.storyIds.filter((id: number) => id !== story.id) };
      }
      return c;
    });

    setCollections(updatedCollections);
    localStorage.setItem('hn-reading-collections', JSON.stringify(updatedCollections));
    setInProgress(false);
  };

  // Icon and text size classes for all views (smaller icons)
  const iconSize = 'w-3 h-3';
  const textSize = viewMode === 'card' ? 'text-[8px] md:text-xs' : 'text-xs md:text-sm';

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
      {/* Upvote Button */}
      {!disableVoting && (
        <button
          onClick={() => onUpvote(story.id)}
          className={`flex items-center gap-1 md:gap-2 group transition-colors ${
            isUpvoted 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-500 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400'
          }`}
          aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
          title={isUpvoted ? "Remove upvote" : "Upvote"}
        >
          <FiArrowUp className={`${iconSize} ${isUpvoted ? 'fill-orange-600/30 dark:fill-orange-400/30' : 'group-hover:fill-orange-600/20 dark:group-hover:fill-orange-400/20'}`} />
          {!isMobile && <span className={`${textSize} font-medium`}>
            {isUpvoted ? 'Upvoted' : 'Upvote'}
          </span>}
        </button>
      )}
      
      {/* Add to Reading List Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleOpenDialog}
            className={`mdh-6 sm:h-7 px-1.5 py-0 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-1 md:gap-2 transition-colors ${textSize}`}
            title="Save to reading list"
          >
            <BookmarkPlus className={iconSize} />
            <span className={textSize}>{isMobile ? '' : 'List'}</span>
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
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded-md flex items-center gap-2 text-sm border border-green-200 dark:border-green-900/30">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Successfully saved to reading list</span>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Story</h4>
              <div className="text-sm p-2 bg-orange-50/50 dark:bg-orange-900/10 rounded-md border border-orange-100/50 dark:border-orange-900/30">
                {story.title}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Select a reading list</h4>
              
              {collections.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No reading lists yet. Create one below.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {collections.map(collection => {
                    const isInCollection = collection.storyIds.includes(story.id);
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
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' 
                            : 'hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{collection.name}</span>
                        {isInCollection && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-medium mb-2">Create new reading list</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="New list name" 
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  className="h-8 sm:h-9 text-sm"
                />
                <Button 
                  onClick={createCollection}
                  disabled={!newCollectionName.trim() || inProgress}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-8 sm:h-9"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hide Button */}
      <button
        onClick={() => onHide(story.id)}
        className={`flex items-center gap-1 md:gap-2 text-gray-500 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 group transition-colors`}
        aria-label="Hide story"
        title="Hide story"
      >
        <FiEyeOff className={iconSize} />
        <span className={`${textSize} font-medium`}>
          {isMobile ? '' : 'Hide'}
        </span>
      </button>
    </div>
  );
}
