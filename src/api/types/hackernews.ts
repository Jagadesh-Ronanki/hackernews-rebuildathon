/**
 * Common types for Hacker News API
 */

/**
 * Item types in Hacker News API
 */
export type ItemType = 'job' | 'story' | 'comment' | 'poll' | 'pollopt';

/**
 * Base interface for all Hacker News items
 */
export interface Item {
  id: number;
  deleted?: boolean;
  type?: ItemType;
  by?: string;
  time?: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number; 
  kids?: number[];
  url?: string; 
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

/**
 * Story item type
 */
export interface Story extends Item {
  type?: ItemType; 
  title: string;
  descendants?: number;
  score?: number;
  kids?: number[];
  url?: string;
}

/**
 * Ask HN Story item type
 */
export interface AskStory extends Story {
  text: string;
}

/**
 * Job item type
 */
export interface Job extends Item {
  type: 'job';
  title: string;
  url?: string;
  text?: string;
}

/**
 * Comment item type
 */
export interface Comment extends Item {
  type: 'comment';
  parent: number;
  text: string;
  kids?: number[];
}

/**
 * Poll item type
 */
export interface Poll extends Item {
  type: 'poll';
  title: string;
  parts: number[];
  descendants?: number;
  score?: number;
  kids?: number[];
}

/**
 * Poll option item type
 */
export interface PollOpt extends Item {
  type: 'pollopt';
  poll: number;
  text: string;
  score?: number;
}

/**
 * User profile
 */
export interface User {
  id: string; 
  created: number;
  karma: number; 
  about?: string;
  submitted?: number[];
}

/**
 * Updates feed
 */
export interface Updates {
  items: number[]; 
  profiles: string[]; 
}
