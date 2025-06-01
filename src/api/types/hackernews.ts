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
  id: number; // The item's unique id. (Required)
  deleted?: boolean; // true if the item is deleted
  type?: ItemType; // The type of item
  by?: string; // The username of the item's author
  time?: number; // Creation date of the item, in Unix Time
  text?: string; // The comment, story or poll text. HTML.
  dead?: boolean; // true if the item is dead
  parent?: number; // The comment's parent: either another comment or the relevant story
  poll?: number; // The pollopt's associated poll
  kids?: number[]; // The ids of the item's comments, in ranked display order
  url?: string; // The URL of the story
  score?: number; // The story's score, or the votes for a pollopt
  title?: string; // The title of the story, poll or job. HTML
  parts?: number[]; // A list of related pollopts, in display order
  descendants?: number; // In the case of stories or polls, the total comment count
}

/**
 * Story item type
 */
export interface Story extends Item {
  type?: ItemType;  // Making type optional to match how it's used in the codebase
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
  id: string; // The user's unique username. Case-sensitive. (Required)
  created: number; // Creation date of the user, in Unix Time. (Required)
  karma: number; // The user's karma. (Required)
  about?: string; // The user's optional self-description. HTML.
  submitted?: number[]; // List of the user's stories, polls and comments.
}

/**
 * Updates feed
 */
export interface Updates {
  items: number[]; // Changed items
  profiles: string[]; // Changed profiles
}
