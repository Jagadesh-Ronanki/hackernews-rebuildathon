import { useState, useEffect } from 'react';
import { hackerNewsService } from '../api';
import { User, Item } from '../api';

interface UseUserResult {
  user: User | null;
  submissions: Item[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUser(username: string, limit: number = 10): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await hackerNewsService.getUserActivity(username, limit);
      setUser(response.user);
      setSubmissions(response.submissions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch user "${username}"`));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [username, limit]);

  return {
    user,
    submissions,
    isLoading,
    error,
    refetch: fetchUser
  };
}
