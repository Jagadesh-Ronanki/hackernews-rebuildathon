import { HackerNewsAPIClient } from './hackernews-api';
import { Item, Story, Comment, User, ItemType } from '../types/hackernews';

/**
 * Type guard to validate that an item has a valid ItemType
 */
function isValidItemType(type: string): type is ItemType {
  return ['job', 'story', 'comment', 'poll', 'pollopt'].includes(type);
}

/**
 * Enhanced API client that provides higher-level methods for working with the Hacker News API
 */
export class HackerNewsService {
  private api: HackerNewsAPIClient;
  
  constructor(api = new HackerNewsAPIClient()) {
    this.api = api;
  }

  /**
   * Get a story with paginated top-level comments
   * @param storyId The ID of the story
   * @param offset The starting index for pagination (default: 0)
   * @param limit The maximum number of top-level comments to fetch (default: 10)
   * @returns Promise with the story and paginated top-level comments
   */
  public async getStoryWithComments(
    storyId: number,
    offset: number = 0,
    limit: number = 10
  ): Promise<{ story: Story, comments: Comment[], totalComments: number }> {
    const story = await this.api.getItem(storyId) as Story;
    
    if (!story) {
      throw new Error(`Story with ID ${storyId} not found`);
    }
    
    if (!story.kids || story.kids.length === 0) {
      return { story, comments: [], totalComments: 0 };
    }
    
    // Get only the subset of top-level comment IDs for the current page
    const totalTopLevelComments = story.kids.length;
    const paginatedCommentIds = story.kids.slice(offset, offset + limit);
    
    // Fetch just the top-level comments first
    const topLevelCommentItems = await this.getMultipleItems(paginatedCommentIds);
    
    // Filter to only include valid comments
    const validComments = topLevelCommentItems.filter((item): item is Comment => 
      item.type === 'comment' && !item.deleted && !item.dead
    );
    
    return { story, comments: validComments, totalComments: totalTopLevelComments };
  }
  
  /**
   * Get replies for a specific comment
   * @param commentId The ID of the comment
   * @returns Promise with the replies to the comment
   */
  public async getCommentReplies(commentId: number): Promise<Comment[]> {
    const comment = await this.api.getItem(commentId) as Comment;
    
    if (!comment || !comment.kids || comment.kids.length === 0) {
      return [];
    }
    
    // Fetch direct replies
    const replyItems = await this.getMultipleItems(comment.kids);
    
    // Filter to only include valid comments
    return replyItems.filter((item): item is Comment => 
      item.type === 'comment' && !item.deleted && !item.dead
    );
  }
  
  // fetchAllComments method has been removed and its functionality 
  // integrated directly into the getStoryWithComments method
  
  /**
   * Get a specific number of top stories with full data
   * @param limit Number of stories to fetch
   * @returns Promise with an array of stories
   */
  public async getTopStoriesWithData(limit: number = 10): Promise<Story[]> {
    const topStoryIds = await this.api.getTopStories();
    return this.getMultipleStories(topStoryIds.slice(0, limit));
  }
  
  /**
   * Get a specific number of new stories with full data
   * @param limit Number of stories to fetch
   * @returns Promise with an array of stories
   */
  public async getNewStoriesWithData(limit: number = 10): Promise<Story[]> {
    const newStoryIds = await this.api.getNewStories();
    return this.getMultipleStories(newStoryIds.slice(0, limit));
  }
  
  /**
   * Get a specific number of best stories with full data
   * @param limit Number of stories to fetch
   * @returns Promise with an array of stories
   */
  public async getBestStoriesWithData(limit: number = 10): Promise<Story[]> {
    const bestStoryIds = await this.api.getBestStories();
    return this.getMultipleStories(bestStoryIds.slice(0, limit));
  }
  
  /**
   * Get a specific number of job stories with full data
   * @param limit Number of job stories to fetch
   * @returns Promise with an array of job stories
   */
  public async getJobsWithData(limit: number = 10): Promise<Item[]> {
    const jobIds = await this.api.getJobStories();
    return this.getMultipleItems(jobIds.slice(0, limit));
  }
  
  /**
   * Get a specific number of Ask HN stories with full data
   * @param limit Number of Ask HN stories to fetch
   * @returns Promise with an array of Ask HN stories
   */
  public async getAskStoriesWithData(limit: number = 10): Promise<Story[]> {
    const askStoryIds = await this.api.getAskStories();
    return this.getMultipleStories(askStoryIds.slice(0, limit));
  }
  
  /**
   * Get a specific number of Show HN stories with full data
   * @param limit Number of Show HN stories to fetch
   * @returns Promise with an array of Show HN stories
   */
  public async getShowStoriesWithData(limit: number = 10): Promise<Story[]> {
    const showStoryIds = await this.api.getShowStories();
    return this.getMultipleStories(showStoryIds.slice(0, limit));
  }
  
  /**
   * Get multiple stories by their IDs
   * @param storyIds Array of story IDs
   * @returns Promise with an array of stories
   */
  public async getMultipleStories(storyIds: number[]): Promise<Story[]> {
    if (!storyIds || storyIds.length === 0) {
      return [];
    }
    
    const items = await this.getMultipleItems(storyIds);
    return items.filter(item => item.type === 'story') as Story[];
  }
  
  /**
   * Get multiple items by their IDs
   * @param itemIds Array of item IDs
   * @returns Promise with an array of items
   */
  public async getMultipleItems(itemIds: number[]): Promise<Item[]> {
    if (!itemIds || itemIds.length === 0) {
      return [];
    }
    
    // Using Promise.all to fetch all items in parallel
    const itemsData = await Promise.all(
      itemIds.map(id => this.api.getItem(id))
    );
    
    // Filter out null values and ensure proper type casting
    return itemsData
      .filter((item): item is Item => item !== null);
  }
  
  /**
   * Get user activity (submissions and comments)
   * @param username The username
   * @returns Promise with the user profile and their submissions
   */
  public async getUserActivity(username: string, limit: number = 10): Promise<{ user: User, submissions: Item[] }> {
    const user = await this.api.getUser(username);
    
    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }
    
    if (!user.submitted || user.submitted.length === 0) {
      return { user, submissions: [] };
    }
    
    // Get the most recent submissions
    const submissions = await this.getMultipleItems(user.submitted.slice(0, limit));
    
    return { user, submissions };
  }

  /**
   * Get the current maximum item ID
   * @returns Promise with the maximum item ID
   */
  public async getMaxItemId(): Promise<number> {
    return this.api.getMaxItemId();
  }

  /**
   * Get updates (changed items and profiles)
   * @returns Promise with updates data
   */
  public async getUpdates() {
    return this.api.getUpdates();
  }

  /**
   * Submit a new story (simulated for demo purposes)
   * @param title The story title
   * @param url The URL of the story (for link posts)
   * @param text The text content (for Ask HN or text posts)
   * @param username The username of the poster
   * @returns Promise with the submitted story
   */
  public async submitStory(title: string, username: string, url?: string, text?: string): Promise<Story> {
    // This is a simulation since the API is read-only
    const timestamp = Math.floor(Date.now() / 1000);
    const randomId = Math.floor(Math.random() * 1000000) + 30000000;
    
    const story: Story = {
      id: randomId,
      type: 'story',
      by: username,
      time: timestamp,
      title: title,
      score: 1,
      descendants: 0,
      kids: []
    };
    
    if (url) {
      story.url = url;
    }
    
    if (text) {
      story.text = text;
    }
    
    // In a real implementation, we would make an API call here
    // For demo purposes, we're just returning the mocked object
    
    return story;
  }

  /**
   * Get a specific item by ID
   * @param id The item ID
   * @returns Promise with the item
   */
  public async getItem(id: number): Promise<Item | null> {
    return this.api.getItem(id);
  }
}
