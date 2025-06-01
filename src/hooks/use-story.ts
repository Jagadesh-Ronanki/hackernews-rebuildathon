import { useState, useEffect, useCallback, useRef } from 'react';
import { hackerNewsService } from '../api';
import { Story, Comment } from '../api';

interface UseStoryResult {
  story: Story | null;
  comments: Comment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  loadMoreComments: () => Promise<boolean>;
  hasMoreComments: boolean;
  loadCommentReplies: (commentId: number) => Promise<Comment[]>;
  refetch: () => Promise<void>;
  commentsPage: number;
}

interface CommentWithChildren {
  id: number;
  type: 'comment';
  by?: string;
  time?: number;
  text?: string;
  parent: number;
  deleted?: boolean;
  dead?: boolean;
  kids?: CommentWithChildren[];
  repliesLoaded?: boolean;
}

export function useStory(storyId: number): UseStoryResult {
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const totalCommentsRef = useRef<number>(0);
  const COMMENTS_PER_PAGE = 10;

  const fetchStory = async () => {
    if (!storyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Initial load with first page of comments
      const response = await hackerNewsService.getStoryWithComments(storyId, 0, COMMENTS_PER_PAGE);
      setStory(response.story);
      totalCommentsRef.current = response.totalComments;
      
      // Save whether there are more comments to load
      setHasMoreComments(COMMENTS_PER_PAGE < response.totalComments);
      
      // Process comments to build a nested tree structure
      const topLevelComments = response.comments.map(comment => ({
        ...comment,
        repliesLoaded: false
      })) as Comment[];
      
      setComments(topLevelComments);
      setCommentsPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch story #${storyId}`));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load more comments (next page)
   */
  const loadMoreComments = useCallback(async (): Promise<boolean> => {
    if (!hasMoreComments || !storyId || isLoadingMore) return false;
    
    setIsLoadingMore(true);
    try {
      const nextPage = commentsPage + 1;
      const offset = (nextPage - 1) * COMMENTS_PER_PAGE;
      
      const response = await hackerNewsService.getStoryWithComments(
        storyId,
        offset,
        COMMENTS_PER_PAGE
      );
      
      // Add the new comments to our existing list
      const newComments = response.comments.map(comment => ({
        ...comment,
        repliesLoaded: false
      })) as Comment[];
      
      setComments(prev => [...prev, ...newComments]);
      setCommentsPage(nextPage);
      
      // Check if we've loaded all available comments
      const hasMore = offset + COMMENTS_PER_PAGE < totalCommentsRef.current;
      setHasMoreComments(hasMore);
      
      return hasMore;
    } catch (err) {
      console.error("Error loading more comments:", err);
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [storyId, commentsPage, hasMoreComments, isLoadingMore]);
  
  /**
   * Load replies for a specific comment
   */
  const loadCommentReplies = useCallback(async (commentId: number): Promise<Comment[]> => {
    try {
      const replies = await hackerNewsService.getCommentReplies(commentId);
      
      // Update the comment in our state to mark that its replies are loaded
      setComments(prevComments => {
        // Create a deep copy to avoid mutating state
        return prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              repliesLoaded: true,
              // Store the fetched replies as a property on the comment
              kids: replies.map(reply => reply.id)
            };
          }
          return comment;
        });
      });
      
      return replies;
    } catch (err) {
      console.error(`Error loading replies for comment #${commentId}:`, err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  return {
    story,
    comments,
    isLoading,
    isLoadingMore,
    error,
    loadMoreComments,
    hasMoreComments,
    loadCommentReplies,
    refetch: fetchStory,
    commentsPage
  };
}
