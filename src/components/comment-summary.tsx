import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, MessageSquareText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CommentSummaryProps {
    storyId: number;
    comments: { text?: string }[];
}

const CommentSummary: React.FC<CommentSummaryProps> = ({ storyId, comments }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    const handleSummarize = async () => {
        if (comments.length === 0) {
            setSummary("No comments to summarize.");
            setShowSummary(true);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const commentTexts = comments.map(c => c.text || '').filter(text => text.trim() !== '');
            if (commentTexts.length === 0) {
                setSummary("No actual text content in comments to summarize.");
                setShowSummary(true);
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comments: commentTexts }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch summary');
            }
            const data = await response.json();
            setSummary(data.summary);
            setShowSummary(true);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setShowSummary(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="my-4 p-4 border border-orange-200 dark:border-orange-900/30 rounded-lg bg-orange-50/30 dark:bg-orange-900/10 backdrop-blur-md">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Understand Comments Quickly</h3>
            </div>
            <Button
                onClick={handleSummarize}
                disabled={isLoading || comments.length === 0}
                variant="outline"
                className="w-full sm:w-auto bg-orange-100 hover:bg-orange-200 dark:bg-orange-800/50 dark:hover:bg-orange-700/60 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
            >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing Comments...</>
                ) : (
                    <><MessageSquareText className="mr-2 h-4 w-4" /> Generate Comment Summary</>
                )}
            </Button>

            {showSummary && summary && (
                <div className="mt-4 pt-3 border-t border-orange-200 dark:border-orange-800/60">
                    <h3 className="text-md font-semibold text-orange-700 dark:text-orange-400 mb-2">AI-Powered Summary:</h3>
                    <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                </div>
            )}
            {error && (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                    <p><strong>Error generating summary:</strong> {error}</p>
                </div>
            )}
             {!isLoading && comments.length === 0 && !summary && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    There are no comments available for this story to summarize.
                </p>
            )}
        </div>
    );
};

export default CommentSummary;
