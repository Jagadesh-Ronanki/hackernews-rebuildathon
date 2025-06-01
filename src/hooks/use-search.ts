import { useState, useEffect } from 'react';
import { hackerNewsService } from '../api';
import { Item } from '../api';

interface UseSearchOptions {
  initialQuery?: string;
  limit?: number;
}

interface UseSearchResult {
  searchResults: Item[];
  isLoading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  totalResults: number;
}

export function useSearch({ initialQuery = '', limit = 30 }: UseSearchOptions = {}): UseSearchResult {
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const search = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchPerformed(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get all available stories from different sources
      const [topStories, newStories, bestStories, askStories, showStories, jobStories] = await Promise.all([
        hackerNewsService.getTopStoriesWithData(50),
        hackerNewsService.getNewStoriesWithData(50),
        hackerNewsService.getBestStoriesWithData(50),
        hackerNewsService.getAskStoriesWithData(50),
        hackerNewsService.getShowStoriesWithData(50),
        hackerNewsService.getJobsWithData(20)
      ]);
      
      // Combine all stories, removing duplicates by ID
      const allItems = [...topStories, ...newStories, ...bestStories, ...askStories, ...showStories, ...jobStories];
      const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
      
      // Simple search implementation
      const queryLower = query.toLowerCase();
      const results = uniqueItems.filter(item => {
        // Search in title
        if (item.title && item.title.toLowerCase().includes(queryLower)) {
          return true;
        }
        
        // Search in text (for comments, self-posts)
        if (item.text && item.text.toLowerCase().includes(queryLower)) {
          return true;
        }
        
        // Search in URL
        if (item.url && item.url.toLowerCase().includes(queryLower)) {
          return true;
        }
        
        // Search by author
        if (item.by && item.by.toLowerCase().includes(queryLower)) {
          return true;
        }
        
        return false;
      }).slice(0, limit);
      
      setSearchResults(results);
      setSearchPerformed(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search stories'));
    } finally {
      setIsLoading(false);
    }
  };

  // Use an effect for the initial search instead of conditional logic during render
  useEffect(() => {
    if (initialQuery && !searchPerformed) {
      search(initialQuery);
    }
  }, [initialQuery, searchPerformed]);

  return {
    searchResults,
    isLoading,
    error,
    search,
    totalResults: searchResults.length
  };
}
