import { useState } from 'react';
import Link from 'next/link';
import { Comment } from '../api';
import { formatTimeAgo } from '../api/utils/helpers';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  toggleExpanded?: () => void;
  isExpanded?: boolean;
  loadReplies?: (commentId: number) => Promise<Comment[]>;
}

export default function CommentItem({ 
  comment, 
  depth = 0, 
  toggleExpanded,
  isExpanded = true,
  loadReplies
}: CommentItemProps) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [isExpand, setIsExpand] = useState(isExpanded);
  
  const timeAgo = comment.time ? formatTimeAgo(comment.time) : '';
  const hasChildren = comment.kids && comment.kids.length > 0;
  const maxDepth = 5;
  const currentDepth = Math.min(depth, maxDepth);
  
  // Use tailwind classes for padding based on depth
  const paddingClasses = [
    'pl-0', 'pl-2 sm:pl-4', 'pl-4 sm:pl-8', 'pl-6 sm:pl-12', 'pl-8 sm:pl-16', 'pl-10 sm:pl-20'
  ];
  const paddingClass = paddingClasses[currentDepth] || paddingClasses[maxDepth];

  const handleToggleExpand = () => {
    if (toggleExpanded) {
      toggleExpanded();
    }
    setIsExpand(!isExpand);
  };
  
  const handleLoadReplies = async () => {
    if (!loadReplies || repliesLoaded || isLoadingReplies) return;
    
    setIsLoadingReplies(true);
    try {
      const fetchedReplies = await loadReplies(comment.id);
      setReplies(fetchedReplies);
      setRepliesLoaded(true);
    } catch (err) {
      console.error(`Error loading replies for comment #${comment.id}:`, err);
    } finally {
      setIsLoadingReplies(false);
    }
  };
  
  // Don't render deleted/dead comments
  if (!comment || !comment.text) return null;
  
  return (
    <div 
      className={`${paddingClass} border-l-2 border-orange-100 dark:border-orange-900/20 ${
        depth > 0 ? 'mt-2' : ''
      }`}
    >
      <div className="bg-orange-200/10 backdrop-blur-md dark:bg-orange-900/10 rounded-md p-2 sm:p-3 transition-all">
        {/* Comment header */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          {comment.by && (
            <Link 
              href={`/user/${comment.by}`}
              className="font-medium text-orange-700 dark:text-orange-400 hover:underline mr-2"
            >
              {comment.by}
            </Link>
          )}
          <span>{timeAgo}</span>
        </div>
        
        {/* Comment text */}
        {comment.text && (
          <div 
            className="prose-sm dark:prose-invert max-w-none text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        )}
        
        {/* Child comments toggle */}
        {hasChildren && (
          <div className="mt-2">
            <button
              onClick={repliesLoaded ? handleToggleExpand : handleLoadReplies}
              className="text-[10px] sm:text-xs font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 inline-flex items-center transition-colors"
            >
              {isLoadingReplies && (
                <span className="mr-1 h-3 w-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></span>
              )}
              {!repliesLoaded && !isLoadingReplies && `Load ${comment.kids?.length || 0} replies`}
              {repliesLoaded && isExpand ? 'Hide replies' : 'Show replies'}
            </button>
          </div>
        )}
      </div>
      
      {/* Child comments */}
      {isExpand && repliesLoaded && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              loadReplies={loadReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
}
