import { HackerNewsAPIClient } from '../../src/api/services/hackernews-api';
import 'cross-fetch/polyfill';

// Mock the fetch API
const mockFetch = (mockResponse: any) => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  ) as jest.Mock;
};

describe('HackerNewsAPIClient', () => {
  let api: HackerNewsAPIClient;

  beforeEach(() => {
    api = new HackerNewsAPIClient();
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should fetch an item by ID', async () => {
      const mockItem = {
        id: 8863,
        type: 'story' as const,
        title: 'My YC app: Dropbox - Throw away your USB drive',
        by: 'dhouston',
        url: 'http://www.getdropbox.com/u/2/screencast.html',
        score: 111,
        time: 1175714200,
      };

      mockFetch(mockItem);
      
      const result = await api.getItem(8863);
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/item/8863.json');
      expect(result).toEqual(mockItem);
    });

    it('should return null for non-existent item', async () => {
      mockFetch(null);
      
      const result = await api.getItem(99999999);
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/item/99999999.json');
      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should fetch a user by username', async () => {
      const mockUser = {
        id: 'jl',
        created: 1173923446,
        karma: 2937,
        about: 'This is a test',
      };

      mockFetch(mockUser);
      
      const result = await api.getUser('jl');
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/user/jl.json');
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      mockFetch(null);
      
      const result = await api.getUser('non_existent_user');
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/user/non_existent_user.json');
      expect(result).toBeNull();
    });
  });

  describe('getMaxItemId', () => {
    it('should fetch the current maximum item ID', async () => {
      mockFetch(9130260);
      
      const result = await api.getMaxItemId();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/maxitem.json');
      expect(result).toBe(9130260);
    });
  });

  describe('getTopStories', () => {
    it('should fetch top stories', async () => {
      const mockStoryIds = [9129911, 9129199, 9127761, 9128141];
      mockFetch(mockStoryIds);
      
      const result = await api.getTopStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/topstories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getNewStories', () => {
    it('should fetch new stories', async () => {
      const mockStoryIds = [9129911, 9129199, 9127761, 9128141];
      mockFetch(mockStoryIds);
      
      const result = await api.getNewStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/newstories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getBestStories', () => {
    it('should fetch best stories', async () => {
      const mockStoryIds = [9129911, 9129199, 9127761, 9128141];
      mockFetch(mockStoryIds);
      
      const result = await api.getBestStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/beststories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getAskStories', () => {
    it('should fetch Ask HN stories', async () => {
      const mockStoryIds = [9127232, 9128437, 9130049, 9130144];
      mockFetch(mockStoryIds);
      
      const result = await api.getAskStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/askstories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getShowStories', () => {
    it('should fetch Show HN stories', async () => {
      const mockStoryIds = [9127232, 9128437, 9130049, 9130144];
      mockFetch(mockStoryIds);
      
      const result = await api.getShowStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/showstories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getJobStories', () => {
    it('should fetch job stories', async () => {
      const mockStoryIds = [9127232, 9128437, 9130049, 9130144];
      mockFetch(mockStoryIds);
      
      const result = await api.getJobStories();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/jobstories.json');
      expect(result).toEqual(mockStoryIds);
    });
  });

  describe('getUpdates', () => {
    it('should fetch updates', async () => {
      const mockUpdates = {
        items: [8423305, 8420805, 8423379],
        profiles: ['thefox', 'mdda', 'plinkplonk']
      };
      mockFetch(mockUpdates);
      
      const result = await api.getUpdates();
      
      expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/updates.json');
      expect(result).toEqual(mockUpdates);
    });
  });

  describe('error handling', () => {
    it('should throw an error when API request fails', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      ) as jest.Mock;

      await expect(api.getItem(8863)).rejects.toThrow('API request failed with status 404: Not Found');
    });
  });
});
