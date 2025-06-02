import { HackerNewsService } from '../../src/api/services/hackernews-service';
import { HackerNewsAPIClient } from '../../src/api/services/hackernews-api';
import { Story, Comment, User } from '../../src/api/types/hackernews';

jest.mock('../../src/api/services/hackernews-api');

describe('HackerNewsService', () => {
  let service: HackerNewsService;
  let mockApiClient: jest.Mocked<HackerNewsAPIClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = new HackerNewsAPIClient() as jest.Mocked<HackerNewsAPIClient>;
    
    // Initialize service with mock API client
    service = new HackerNewsService(mockApiClient);
  });

  describe('getStoryWithComments', () => {
    it('should fetch a story with its comments', async () => {
      const mockStory: Story = {
        id: 123,
        type: 'story',
        title: 'Test Story',
        kids: [456, 789],
        by: 'testuser',
        time: 1234567890,
      };
      
      const mockComment1: Comment = {
        id: 456,
        type: 'comment',
        text: 'Test comment 1',
        parent: 123,
        by: 'commenter1',
        time: 1234567891,
      };
      
      const mockComment2: Comment = {
        id: 789,
        type: 'comment',
        text: 'Test comment 2',
        parent: 123,
        kids: [101112],
        by: 'commenter2',
        time: 1234567892,
      };
      
      const mockNestedComment: Comment = {
        id: 101112,
        type: 'comment',
        text: 'Nested comment',
        parent: 789,
        by: 'commenter3',
        time: 1234567893,
      };

      // Setup mocks
      mockApiClient.getItem
        .mockResolvedValueOnce(mockStory)
        .mockResolvedValueOnce(mockComment1)
        .mockResolvedValueOnce(mockComment2)
        .mockResolvedValueOnce(mockNestedComment);

      // Call the method
      const result = await service.getStoryWithComments(123);

      // Assertions
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(456);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(789);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(101112);
      
      expect(result).toEqual({
        story: mockStory,
        comments: [mockComment1, mockComment2, mockNestedComment]
      });
    });

    it('should handle stories with no comments', async () => {
      const mockStory: Story = {
        id: 123,
        type: 'story',
        title: 'Test Story',
        by: 'testuser',
        time: 1234567890,
      };

      // Setup mocks
      mockApiClient.getItem.mockResolvedValueOnce(mockStory);

      // Call the method
      const result = await service.getStoryWithComments(123);

      // Assertions
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
      expect(result).toEqual({
        story: mockStory,
        comments: []
      });
    });

    it('should throw an error if story not found', async () => {
      // Setup mocks
      mockApiClient.getItem.mockResolvedValueOnce(null);

      // Call the method and expect it to throw
      await expect(service.getStoryWithComments(123)).rejects
        .toThrow('Story with ID 123 not found');

      // Assertions
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
    });
  });

  describe('getTopStoriesWithData', () => {
    it('should fetch top stories with data', async () => {
      const mockStoryIds = [123, 456, 789];
      const mockStories: Story[] = [
        {
          id: 123,
          type: 'story',
          title: 'Test Story 1',
          by: 'user1',
          time: 1234567890,
        },
        {
          id: 456,
          type: 'story',
          title: 'Test Story 2',
          by: 'user2',
          time: 1234567891,
        },
        {
          id: 789,
          type: 'story',
          title: 'Test Story 3',
          by: 'user3',
          time: 1234567892,
        }
      ];

      // Setup mocks
      mockApiClient.getTopStories.mockResolvedValueOnce(mockStoryIds);
      mockApiClient.getItem
        .mockResolvedValueOnce(mockStories[0])
        .mockResolvedValueOnce(mockStories[1])
        .mockResolvedValueOnce(mockStories[2]);

      // Call the method
      const result = await service.getTopStoriesWithData(3);

      // Assertions
      expect(mockApiClient.getTopStories).toHaveBeenCalled();
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(456);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(789);
      expect(result).toEqual(mockStories);
    });

    it('should limit the number of stories fetched', async () => {
      const mockStoryIds = [123, 456, 789, 101112];
      const mockStories: Story[] = [
        {
          id: 123,
          type: 'story',
          title: 'Test Story 1',
          by: 'user1',
          time: 1234567890,
        },
        {
          id: 456,
          type: 'story',
          title: 'Test Story 2',
          by: 'user2',
          time: 1234567891,
        }
      ];

      // Setup mocks
      mockApiClient.getTopStories.mockResolvedValueOnce(mockStoryIds);
      mockApiClient.getItem
        .mockResolvedValueOnce(mockStories[0])
        .mockResolvedValueOnce(mockStories[1]);

      // Call the method with limit of 2
      const result = await service.getTopStoriesWithData(2);

      // Assertions
      expect(mockApiClient.getTopStories).toHaveBeenCalled();
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(456);
      expect(mockApiClient.getItem).not.toHaveBeenCalledWith(789);
      expect(mockApiClient.getItem).not.toHaveBeenCalledWith(101112);
      expect(result).toEqual(mockStories);
    });
  });

  describe('getUserActivity', () => {
    it('should fetch user activity', async () => {
      const mockUser: User = {
        id: 'testuser',
        created: 1234567890,
        karma: 100,
        submitted: [123, 456, 789]
      };
      
      const mockSubmissions = [
        {
          id: 123,
          type: 'story' as const,
          title: 'Test Story',
          by: 'testuser',
          time: 1234567891,
        },
        {
          id: 456,
          type: 'comment' as const,
          text: 'Test comment',
          parent: 789,
          by: 'testuser',
          time: 1234567892,
        },
        {
          id: 789,
          type: 'story' as const,
          title: 'Another Story',
          by: 'testuser',
          time: 1234567893,
        }
      ];

      // Setup mocks
      mockApiClient.getUser.mockResolvedValueOnce(mockUser);
      mockApiClient.getItem
        .mockResolvedValueOnce(mockSubmissions[0])
        .mockResolvedValueOnce(mockSubmissions[1])
        .mockResolvedValueOnce(mockSubmissions[2]);

      // Call the method
      const result = await service.getUserActivity('testuser');

      // Assertions
      expect(mockApiClient.getUser).toHaveBeenCalledWith('testuser');
      expect(mockApiClient.getItem).toHaveBeenCalledWith(123);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(456);
      expect(mockApiClient.getItem).toHaveBeenCalledWith(789);
      expect(result).toEqual({
        user: mockUser,
        submissions: mockSubmissions
      });
    });

    it('should handle users with no submissions', async () => {
      const mockUser: User = {
        id: 'testuser',
        created: 1234567890,
        karma: 100,
        // No submitted property
      };

      // Setup mocks
      mockApiClient.getUser.mockResolvedValueOnce(mockUser);

      // Call the method
      const result = await service.getUserActivity('testuser');

      // Assertions
      expect(mockApiClient.getUser).toHaveBeenCalledWith('testuser');
      expect(mockApiClient.getItem).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: mockUser,
        submissions: []
      });
    });

    it('should throw an error if user not found', async () => {
      // Setup mocks
      mockApiClient.getUser.mockResolvedValueOnce(null);

      // Call the method and expect it to throw
      await expect(service.getUserActivity('testuser')).rejects
        .toThrow('User with username testuser not found');

      // Assertions
      expect(mockApiClient.getUser).toHaveBeenCalledWith('testuser');
    });
  });
});
