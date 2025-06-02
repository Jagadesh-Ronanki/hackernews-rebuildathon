import * as helpers from '../../src/api/utils/helpers';

describe('API utility functions', () => {
  describe('formatTimeAgo', () => {
    it('should format seconds correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 30)).toMatch(/30 seconds? ago/);
      expect(helpers.formatTimeAgo(now - 1)).toMatch(/1 second ago/);
    });
    
    it('should format minutes correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 60)).toMatch(/1 minute ago/);
      expect(helpers.formatTimeAgo(now - 120)).toMatch(/2 minutes? ago/);
    });
    
    it('should format hours correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 3600)).toMatch(/1 hour ago/);
      expect(helpers.formatTimeAgo(now - 7200)).toMatch(/2 hours? ago/);
    });
    
    it('should format days correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 86400)).toMatch(/1 day ago/);
      expect(helpers.formatTimeAgo(now - 172800)).toMatch(/2 days? ago/);
    });
    
    it('should format months correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 2592000)).toMatch(/1 month ago/);
      expect(helpers.formatTimeAgo(now - 5184000)).toMatch(/2 months? ago/);
    });
    
    it('should format years correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(helpers.formatTimeAgo(now - 31104000)).toMatch(/1 year ago/);
      expect(helpers.formatTimeAgo(now - 62208000)).toMatch(/2 years? ago/);
    });
    
    it('should handle undefined or falsy inputs', () => {
      expect(helpers.formatTimeAgo(0)).toBe('');
      expect(helpers.formatTimeAgo(null as any)).toBe('');
      expect(helpers.formatTimeAgo(undefined as any)).toBe('');
    });
  });
  
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const timestamp = 1682956800;
      const result = helpers.formatDate(timestamp);
      
      expect(result).toContain('2023');
      expect(result).toContain('May');
      expect(result).toContain('1');
    });
    
    it('should handle undefined or falsy inputs', () => {
      expect(helpers.formatDate(0)).toBe('');
      expect(helpers.formatDate(null as any)).toBe('');
      expect(helpers.formatDate(undefined as any)).toBe('');
    });
  });
  
  describe('extractDomain', () => {
    it('should extract domain from URLs correctly', () => {
      expect(helpers.extractDomain('https://www.example.com/page')).toBe('example.com');
      expect(helpers.extractDomain('http://news.ycombinator.com/')).toBe('news.ycombinator.com');
      expect(helpers.extractDomain('https://sub.domain.example.org/path?query=1')).toBe('sub.domain.example.org');
    });
    
    it('should remove www. from domains', () => {
      expect(helpers.extractDomain('https://www.example.com')).toBe('example.com');
    });
    
    it('should handle invalid URLs gracefully', () => {
      expect(helpers.extractDomain('not a url')).toBe('');
      expect(helpers.extractDomain('')).toBe('');
      expect(helpers.extractDomain(null as any)).toBe('');
      expect(helpers.extractDomain(undefined as any)).toBe('');
    });
  });
  
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
      expect(helpers.sanitizeHtml(html)).toBe('<p>Hello</p><p>World</p>');
    });
    
    it('should remove iframe tags', () => {
      const html = '<p>Content</p><iframe src="https://evil.com"></iframe>';
      expect(helpers.sanitizeHtml(html)).toBe('<p>Content</p>');
    });
    
    it('should remove event handlers', () => {
      const html = '<a href="#" onclick="evil()">Click me</a>';
      expect(helpers.sanitizeHtml(html)).toBe('<a href="#" >Click me</a>');
      
      const html2 = '<button onmouseover="evil()">Hover</button>';
      expect(helpers.sanitizeHtml(html2)).toBe('<button >Hover</button>');
    });
    
    it('should handle undefined or falsy inputs', () => {
      expect(helpers.sanitizeHtml('')).toBe('');
      expect(helpers.sanitizeHtml(null as any)).toBe('');
      expect(helpers.sanitizeHtml(undefined as any)).toBe('');
    });
  });
  
  describe('truncateText', () => {
    it('should truncate text to specified length', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(helpers.truncateText(longText, 10)).toBe('This is a...');
      expect(helpers.truncateText(longText, 20)).toBe('This is a very long...');
    });
    
    it('should not truncate text shorter than max length', () => {
      const shortText = 'Short text';
      expect(helpers.truncateText(shortText, 20)).toBe(shortText);
    });
    
    it('should handle undefined or falsy inputs', () => {
      expect(helpers.truncateText('')).toBe('');
      expect(helpers.truncateText(null as any)).toBe('');
      expect(helpers.truncateText(undefined as any)).toBe('');
    });
  });
  
  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(helpers.formatNumber(123)).toBe('123');
      expect(helpers.formatNumber(1234)).toBe('1.2k');
      expect(helpers.formatNumber(12345)).toBe('12.3k');
      expect(helpers.formatNumber(1234567)).toBe('1.2m');
    });
    
    it('should handle undefined or falsy inputs', () => {
      expect(helpers.formatNumber(0)).toBe('0');
      expect(helpers.formatNumber(null as any)).toBe('0');
      expect(helpers.formatNumber(undefined as any)).toBe('0');
    });
  });
});
