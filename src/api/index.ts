import { HackerNewsAPIClient } from './services/hackernews-api';
import { HackerNewsService } from './services/hackernews-service';
import { Item, Story, Comment, User, Updates, ItemType, AskStory, Job, Poll, PollOpt } from './types/hackernews';
import * as Helpers from './utils/helpers';
import * as Examples from './examples/usage-examples';

// Export types
export type {
  Item,
  Story,
  Comment,
  User,
  Updates,
  ItemType,
  AskStory,
  Job,
  Poll,
  PollOpt
};

// Export API client and service
export {
  HackerNewsAPIClient,
  HackerNewsService
};

// Export utility functions
export const utils = {
  formatTimeAgo: Helpers.formatTimeAgo,
  formatDate: Helpers.formatDate,
  extractDomain: Helpers.extractDomain,
  sanitizeHtml: Helpers.sanitizeHtml,
  truncateText: Helpers.truncateText,
  formatNumber: Helpers.formatNumber
};

// Export examples
export const examples = {
  fetchTopStories: Examples.fetchTopStories,
  fetchStoryWithComments: Examples.fetchStoryWithComments,
  fetchUserProfile: Examples.fetchUserProfile,
  monitorUpdates: Examples.monitorUpdates,
  stopMonitoringUpdates: Examples.stopMonitoringUpdates
};

// Create and export default instance
export const hackerNewsClient = new HackerNewsAPIClient();
export const hackerNewsService = new HackerNewsService(hackerNewsClient);

export default hackerNewsService;
