import { useState, useEffect } from 'react';
import { hackerNewsService } from '../api';
import { Story, Item } from '../api';

type StoryType = 'top' | 'new' | 'best' | 'job' | 'ask' | 'show';
type SortType = 'default' | 'points' | 'comments' | 'newest' | 'oldest';

interface UseStoriesOptions {
  type?: StoryType;
  limit?: number;
  page?: number;
  itemsPerPage?: number;
  sortBy?: SortType;
  filterDomain?: string;
  filterKeyword?: string;
}

interface UseStoriesResult {
  stories: Story[];
  isLoading: boolean;
  error: Error | null;
  totalStories: number;
  refetch: () => Promise<void>;
}

export function useStories({
  type = 'top',
  limit = 50,
  page = 1,
  itemsPerPage = 10,
  sortBy = 'default',
  filterDomain = '',
  filterKeyword = ''
}: UseStoriesOptions = {}): UseStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedStories: Story[] | Item[] = [];
      
      switch (type) {
        case 'top':
          fetchedStories = await hackerNewsService.getTopStoriesWithData(limit);
          break;
        case 'new':
          fetchedStories = await hackerNewsService.getNewStoriesWithData(limit);
          break;
        case 'best':
          fetchedStories = await hackerNewsService.getBestStoriesWithData(limit);
          break;
        case 'job':
          fetchedStories = await hackerNewsService.getJobsWithData(limit) as Story[];
          break;
        case 'ask':
          fetchedStories = await hackerNewsService.getAskStoriesWithData(limit);
          break;
        case 'show':
          fetchedStories = await hackerNewsService.getShowStoriesWithData(limit);
          break;
        default:
          fetchedStories = await hackerNewsService.getTopStoriesWithData(limit);
      }
      
      setAllStories(fetchedStories as Story[]);
      
      // Paginate the stories
      const startIdx = (page - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setStories((fetchedStories as Story[]).slice(startIdx, endIdx));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [type, limit]);

  // Handle filtering, sorting and pagination
  useEffect(() => {
    if (allStories.length > 0) {
      let filteredStories = [...allStories];
      
      // Apply domain filter if provided
      if (filterDomain) {
        filteredStories = filteredStories.filter(story => {
          if (!story.url) return false;
          try {
            const domain = new URL(story.url).hostname.replace(/^www\./, '');
            return domain.includes(filterDomain.toLowerCase());
          } catch {
            return false;
          }
        });
      }
      
      // Apply keyword filter if provided
      if (filterKeyword) {
        const keyword = filterKeyword.toLowerCase();
        filteredStories = filteredStories.filter(story => {
          return (
            (story.title && story.title.toLowerCase().includes(keyword)) ||
            (story.text && story.text.toLowerCase().includes(keyword)) ||
            (story.by && story.by.toLowerCase().includes(keyword))
          );
        });
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'points':
          filteredStories = filteredStories.sort((a, b) => (b.score || 0) - (a.score || 0));
          break;
        case 'comments':
          filteredStories = filteredStories.sort((a, b) => (b.descendants || 0) - (a.descendants || 0));
          break;
        case 'newest':
          filteredStories = filteredStories.sort((a, b) => (b.time || 0) - (a.time || 0));
          break;
        case 'oldest':
          filteredStories = filteredStories.sort((a, b) => (a.time || 0) - (b.time || 0));
          break;
        default:
          // Default sorting is already applied by the API
          break;
      }
      
      // Apply pagination
      const startIdx = (page - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setStories(filteredStories.slice(startIdx, endIdx));
    }
  }, [page, itemsPerPage, allStories, sortBy, filterDomain, filterKeyword]);
  
  // Get total filtered stories count for pagination
  const calculateTotalFilteredStories = (): number => {
    if (!filterDomain && !filterKeyword) return allStories.length;
    
    let count = allStories.length;
    
    // Only recompute if we have filters
    if (filterDomain || filterKeyword) {
      count = allStories.filter(story => {
        let passesFilter = true;
        
        // Domain filter
        if (filterDomain && story.url) {
          try {
            const domain = new URL(story.url).hostname.replace(/^www\./, '');
            passesFilter = domain.includes(filterDomain.toLowerCase());
          } catch {
            return false;
          }
        }
        
        // Keyword filter
        if (filterKeyword && passesFilter) {
          const keyword = filterKeyword.toLowerCase();
          const titleMatch = story.title ? story.title.toLowerCase().includes(keyword) : false;
          const textMatch = story.text ? story.text.toLowerCase().includes(keyword) : false;
          const byMatch = story.by ? story.by.toLowerCase().includes(keyword) : false;
          
          passesFilter = titleMatch || textMatch || byMatch;
        }
        
        return passesFilter;
      }).length;
    }
    
    return count;
  };
  
  const totalFilteredStories = calculateTotalFilteredStories();

  return {
    stories,
    isLoading,
    error,
    totalStories: totalFilteredStories,
    refetch: fetchStories
  };
}
