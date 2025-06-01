/**
 * Utility functions for working with Hacker News API data
 */

/**
 * Convert Unix timestamp to a readable date string
 * 
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return '';
  
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  
  // Less than a minute
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a month
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  // Years
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Format timestamp to a locale date string
 * 
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Extract domain from URL
 * 
 * @param url URL string
 * @returns Domain name or empty string if URL is invalid
 */
export function extractDomain(url: string): string {
  if (!url) return '';
  
  try {
    const hostname = new URL(url).hostname;
    // Remove 'www.' if present
    return hostname.replace(/^www\./, '');
  } catch (error) {
    return '';
  }
}

/**
 * Sanitize HTML content (very basic implementation)
 * Note: In production, use a proper HTML sanitizer library
 * 
 * @param html HTML content string
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Very basic sanitization (for demo purposes only)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Truncate text to specified length with ellipsis
 * 
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format a large number with k, m suffixes
 * 
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  if (!num) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  
  return num.toString();
}

/**
 * Extract potential topics/tags from a story title or text
 * 
 * @param title Story title
 * @param text Optional story text
 * @returns Array of potential topic tags
 */
export function extractTopics(title: string, text?: string): string[] {
  const commonTechWords = [
    'javascript', 'typescript', 'python', 'react', 'vue', 'angular', 
    'node', 'deno', 'rust', 'go', 'golang', 'java', 'kotlin', 'swift',
    'ai', 'ml', 'machine learning', 'data', 'cloud', 'aws', 'azure', 
    'gcp', 'serverless', 'blockchain', 'crypto', 'web3', 'nft', 
    'security', 'privacy', 'open source', 'github', 'git'
  ];
  
  if (!title && !text) return [];
  
  const content = `${title || ''} ${text || ''}`.toLowerCase();
  return commonTechWords.filter(word => content.includes(word.toLowerCase()));
}
