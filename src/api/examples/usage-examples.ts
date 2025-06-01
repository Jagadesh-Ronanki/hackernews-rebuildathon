/**
 * Examples for using the Hacker News API client
 */

import { hackerNewsService, hackerNewsClient, Story, Comment, User } from '../index';
import { formatTimeAgo, extractDomain } from '../utils/helpers';

/**
 * Example: Fetch and display top stories
 */
export async function fetchTopStories(limit: number = 10): Promise<Story[]> {
  try {
    console.log('Fetching top stories...');
    const stories = await hackerNewsService.getTopStoriesWithData(limit);
    
    stories.forEach((story, index) => {
      console.log(`${index + 1}. ${story.title} (${story.score} points)`);
      console.log(`   by ${story.by} ${formatTimeAgo(story.time || 0)}`);
      
      if (story.url) {
        console.log(`   ${extractDomain(story.url)}`);
      }
      
      console.log(`   ${story.descendants || 0} comments`);
      console.log('');
    });
    
    return stories;
  } catch (error) {
    console.error('Error fetching top stories:', error);
    return [];
  }
}

/**
 * Example: Fetch and display story with comments
 */
export async function fetchStoryWithComments(storyId: number): Promise<{ story: Story, comments: Comment[] } | null> {
  try {
    console.log(`Fetching story #${storyId} with comments...`);
    const result = await hackerNewsService.getStoryWithComments(storyId);
    
    const { story, comments } = result;
    
    console.log(`${story.title} (${story.score} points)`);
    console.log(`by ${story.by} ${formatTimeAgo(story.time || 0)}`);
    
    if (story.url) {
      console.log(`${story.url}`);
    }
    
    console.log('');
    console.log(`${comments.length} comments found`);
    
    // Display top-level comments only
    const topLevelComments = comments.filter(comment => comment.parent === storyId);
    
    topLevelComments.forEach((comment, index) => {
      console.log(`${index + 1}. ${comment.by} ${formatTimeAgo(comment.time || 0)}`);
      console.log(`   ${comment.text?.replace(/<[^>]*>?/gm, '')}`); // Strip HTML
      console.log('');
    });
    
    return result;
  } catch (error) {
    console.error(`Error fetching story #${storyId} with comments:`, error);
    return null;
  }
}

/**
 * Example: Fetch and display user profile with recent activity
 */
export async function fetchUserProfile(username: string): Promise<{ user: User, submissions: any[] } | null> {
  try {
    console.log(`Fetching profile for user ${username}...`);
    const result = await hackerNewsService.getUserActivity(username);
    
    const { user, submissions } = result;
    
    console.log(`Username: ${user.id}`);
    console.log(`Created: ${new Date(user.created * 1000).toLocaleDateString()}`);
    console.log(`Karma: ${user.karma}`);
    
    if (user.about) {
      console.log(`About: ${user.about.replace(/<[^>]*>?/gm, '')}`); // Strip HTML
    }
    
    console.log('');
    console.log('Recent activity:');
    
    submissions.forEach((item, index) => {
      console.log(`${index + 1}. [${item.type}] ${item.title || item.text?.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...'}`);
      console.log(`   ${formatTimeAgo(item.time || 0)}`);
      console.log('');
    });
    
    return result;
  } catch (error) {
    console.error(`Error fetching profile for user ${username}:`, error);
    return null;
  }
}

/**
 * Example: Live updates monitoring
 */
export async function monitorUpdates(intervalSeconds: number = 60): Promise<NodeJS.Timeout> {
  console.log(`Starting updates monitor (interval: ${intervalSeconds}s)...`);
  
  // Initial fetch
  let lastItems = new Set<number>();
  let lastProfiles = new Set<string>();
  
  try {
    const updates = await hackerNewsClient.getUpdates();
    
    updates.items.forEach(id => lastItems.add(id));
    updates.profiles.forEach(name => lastProfiles.add(name));
    
    console.log(`Initial state: ${updates.items.length} items, ${updates.profiles.length} profiles`);
  } catch (error) {
    console.error('Error fetching initial updates:', error);
  }
  
  // Setup interval for checking updates
  const intervalId = setInterval(async () => {
    try {
      const updates = await hackerNewsClient.getUpdates();
      
      // Find new items
      const newItems = updates.items.filter(id => !lastItems.has(id));
      
      // Find new profiles
      const newProfiles = updates.profiles.filter(name => !lastProfiles.has(name));
      
      if (newItems.length > 0) {
        console.log(`${newItems.length} new items updated`);
        
        // Get details for first 3 new items
        for (let i = 0; i < Math.min(3, newItems.length); i++) {
          const item = await hackerNewsClient.getItem(newItems[i]);
          console.log(`- [${item?.type}] ID: ${item?.id} by ${item?.by}`);
        }
        
        // Update last items set
        newItems.forEach(id => lastItems.add(id));
      }
      
      if (newProfiles.length > 0) {
        console.log(`${newProfiles.length} profiles updated`);
        
        // Get details for first 3 new profiles
        for (let i = 0; i < Math.min(3, newProfiles.length); i++) {
          const user = await hackerNewsClient.getUser(newProfiles[i]);
          console.log(`- User: ${user?.id}, karma: ${user?.karma}`);
        }
        
        // Update last profiles set
        newProfiles.forEach(name => lastProfiles.add(name));
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  }, intervalSeconds * 1000);
  
  return intervalId;
}

/**
 * Stop monitoring updates
 */
export function stopMonitoringUpdates(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.log('Updates monitor stopped');
}
