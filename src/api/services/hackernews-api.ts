import { API_CONFIG } from '../config';
import { Item, User, Updates, ItemType } from '../types/hackernews';

/**
 * Base API client for fetching data from Hacker News API
 */
export class HackerNewsAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request to the Hacker News API
   * @param endpoint The API endpoint to call
   * @returns Promise with the response data
   */
  private async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get an item by its ID
   * @param id The item's ID
   * @returns Promise with the item data
   */
  public async getItem(id: number): Promise<Item | null> {
    const item = await this.get<Item | null>(`/item/${id}.json`);
    
    // Validate and ensure proper type casting for the 'type' field
    if (item && item.type && typeof item.type === 'string') {
      return {
        ...item,
        type: item.type as ItemType
      };
    }
    
    return item;
  }

  /**
   * Get a user profile by username
   * @param username The username
   * @returns Promise with the user profile data
   */
  public async getUser(username: string): Promise<User | null> {
    return this.get<User | null>(`/user/${username}.json`);
  }

  /**
   * Get the current maximum item ID
   * @returns Promise with the maximum item ID
   */
  public async getMaxItemId(): Promise<number> {
    return this.get<number>('/maxitem.json');
  }

  /**
   * Get up to 500 top stories
   * @returns Promise with an array of top story IDs
   */
  public async getTopStories(): Promise<number[]> {
    return this.get<number[]>('/topstories.json');
  }

  /**
   * Get up to 500 new stories
   * @returns Promise with an array of new story IDs
   */
  public async getNewStories(): Promise<number[]> {
    return this.get<number[]>('/newstories.json');
  }

  /**
   * Get the best stories
   * @returns Promise with an array of best story IDs
   */
  public async getBestStories(): Promise<number[]> {
    return this.get<number[]>('/beststories.json');
  }

  /**
   * Get up to 200 Ask HN stories
   * @returns Promise with an array of Ask HN story IDs
   */
  public async getAskStories(): Promise<number[]> {
    return this.get<number[]>('/askstories.json');
  }

  /**
   * Get up to 200 Show HN stories
   * @returns Promise with an array of Show HN story IDs
   */
  public async getShowStories(): Promise<number[]> {
    return this.get<number[]>('/showstories.json');
  }

  /**
   * Get up to 200 job stories
   * @returns Promise with an array of job story IDs
   */
  public async getJobStories(): Promise<number[]> {
    return this.get<number[]>('/jobstories.json');
  }

  /**
   * Get updates (changed items and profiles)
   * @returns Promise with updates data
   */
  public async getUpdates(): Promise<Updates> {
    return this.get<Updates>('/updates.json');
  }
}
