'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, Stars, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
}

const AskPageWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      const mainContentElement = document.getElementById('main-scrollable-content');
      const content = mainContentElement ? mainContentElement.innerText : document.body.innerText;
      setPageContent(content.substring(0, 15000)); // Limit content length
      const textarea = widgetRef.current?.querySelector('textarea');
      textarea?.focus();
    } else {
      setMessages([]);
      setCurrentQuestion('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        const fabButton = document.getElementById('ask-page-fab');
        if (fabButton && fabButton.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [widgetRef]);

  const handleSubmit = useCallback(async (questionToSend?: string) => {
    const question = questionToSend || currentQuestion;
    if (!question.trim()) return;

    const newUserMessage: Message = { id: Date.now().toString() + 'user', type: 'user', content: question };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentQuestion('');
    setIsLoading(true);

    const conversationHistory = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    conversationHistory.push({ role: 'user', parts: [{ text: question }] });

    try {
      const response = await fetch('/api/ask-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageContent, question, history: conversationHistory.slice(-10) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get an answer.');
      }

      const data = await response.json();
      const newAiMessage: Message = { id: Date.now().toString() + 'ai', type: 'ai', content: data.answer };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (err: any) {
      const newErrorMessage: Message = { id: Date.now().toString() + 'error', type: 'error', content: err.message || 'An unexpected error occurred.' };
      setMessages(prev => [...prev, newErrorMessage]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        widgetRef.current?.querySelector('textarea')?.focus();
      });
    }
  }, [currentQuestion, pageContent, messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        id="ask-page-fab"
        onClick={toggleOpen}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-14 w-14 rounded-md shadow-lg bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700 border-none z-50"
        aria-label="Ask a question about this page"
      >
        {isOpen ? <X size={28} /> : <Stars size={28} />}
      </Button>

      {isOpen && (
        <div
          ref={widgetRef}
          className={cn(
            "fixed bottom-24 right-6 sm:bottom-28 sm:right-8 w-[calc(100vw-3rem)] max-w-md h-auto max-h-[70vh]",
            "bg-orange-50 dark:bg-gray-900/80 backdrop-blur-md shadow-xl rounded-lg border border-orange-200 dark:border-gray-700",
            "flex flex-col transition-all duration-300 ease-in-out z-40 overflow-hidden"
          )}
        >
          <div className="p-4 border-b border-orange-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-orange-700 dark:text-orange-400 text-lg">Ask about this page</h3>
            <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-500">
              Clear Chat
            </Button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto space-y-3 min-h-[100px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none p-3 rounded-md shadow-sm",
                  msg.type === 'user' && "bg-orange-100 dark:bg-gray-700 ml-auto",
                  msg.type === 'ai' && "bg-white dark:bg-gray-800",
                  msg.type === 'error' && "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                )}
              >
                {msg.type === 'error' ? (
                  <p>{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1].type !== 'ai' && messages[messages.length -1].type !== 'error' && (
              <div className="flex items-center justify-start py-2">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                <p className="ml-2 text-xs text-gray-500 dark:text-gray-400">Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-orange-200 dark:border-gray-700 bg-orange-50/50 dark:bg-gray-900/50">
            <div className="flex items-start space-x-2">
              <Textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask anything about this page..."
                className="flex-1 resize-none bg-white dark:bg-gray-750 border-orange-300 dark:border-gray-600 focus:ring-1 focus:ring-orange-500"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-auto p-2.5 bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700 shrink-0"
                disabled={isLoading || !currentQuestion.trim()}
                aria-label="Send question"
              >
                <Send size={20} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AskPageWidget;
