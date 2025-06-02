'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useAIFeedback } from './ai-feedback-context'

export interface PageActions {
  goToNextPage?: () => void;
  goToPrevPage?: () => void;
  setItemsPerPage?: (count: number) => void;
  searchByKeyword?: (keyword: string) => void;
  sortByPreference?: (sortType: 'default' | 'points' | 'comments' | 'newest' | 'oldest') => void;
  setDomainFilter?: (domain: string) => void;
  clearDomainFilter?: () => void;
  clearKeywordFilter?: () => void;
  setViewMode?: (mode: 'normal' | 'compact' | 'card') => void;
  setFontSize?: (size: 'small' | 'normal' | 'large') => void;
  clearAllFilters?: () => void;
}

interface VoiceControlContextType {
  isListening: boolean
  setIsListening: (listening: boolean) => void
  isProcessing: boolean
  registerPageActions: (actions: PageActions) => void
  unregisterPageActions: () => void
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined)

export function VoiceControlProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string[]>([])
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  const { setFeedback } = useAIFeedback()
  const pageActionsRef = useRef<PageActions | null>(null)

  const registerPageActions = (actions: PageActions) => {
    pageActionsRef.current = actions;
  };

  const unregisterPageActions = () => {
    pageActionsRef.current = null;
  };

  const processCommand = async (command: string) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    setFeedback({
      isProcessing: true,
      command,
      action: '',
      reason: ''
    })
    
    setConversationHistory(prev => [...prev.slice(-4), command])
    
    try {
      const response = await fetch('/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          context: {
            theme: theme || 'light',
            page: pathname,
            history: conversationHistory
          }
        })
      })
      
      const data = await response.json()
      
      setFeedback({
        isProcessing: false,
        command,
        action: data.actions.map((a: any) => a.action).join(', '), // Combine actions for display
        reason: data.reason
      })
      
      for (const actionItem of data.actions) {
        const currentAction = actionItem.action;
        const currentValue = actionItem.value;

        console.log('Processing action:', currentAction, 'with value:', currentValue);
        switch (currentAction) {
          case 'theme':
            if (currentValue === 'dark') {
              console.log('Condition matched: theme:dark');
              setTheme('dark');
              console.log('Executed setTheme(dark)');
            } else if (currentValue === 'light') {
              console.log('Condition matched: theme:light');
              setTheme('light');
              console.log('Executed setTheme(light)');
            } else {
              console.warn(`Unknown theme value: ${currentValue} for action: theme`);
            }
            break;
          case 'navigate':
            if (currentValue === 'home') {
              router.push('/');
            } else if (currentValue === 'about') {
              router.push('/about');
            } else if (currentValue === 'back') {
              router.back();
            } else if (currentValue === 'forward') {
              router.forward();
            } else if (['top', 'new', 'best', 'ask', 'show', 'job'].includes(currentValue)) {
              router.push(`/?type=${currentValue}`);
            } else {
              console.warn(`Unknown navigation value: ${currentValue} for action: navigate`);
            }
            break;
          case 'scroll':
            if (currentValue === 'top') {
              const mainScrollable = document.querySelector('#main-scrollable-content');
              if (mainScrollable) {
                mainScrollable.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                console.error('#main-scrollable-content not found');
              }
            } else if (currentValue === 'bottom') {
              const mainScrollable = document.querySelector('#main-scrollable-content');
              if (mainScrollable) {
                mainScrollable.scrollTo({ top: mainScrollable.scrollHeight, behavior: 'smooth' });
              } else {
                console.error('#main-scrollable-content not found');
              }
            } else {
              console.warn(`Unknown scroll value: ${currentValue} for action: scroll`);
            }
            break;
          case 'page':
            if (currentValue === 'refresh') {
              window.location.reload();
            } else {
              console.warn(`Unknown page value: ${currentValue} for action: page`);
            }
            break;
          case 'pagination':
            if (currentValue === 'next') {
              pageActionsRef.current?.goToNextPage?.();
            } else if (currentValue === 'prev') {
              pageActionsRef.current?.goToPrevPage?.();
            }
            break;
          case 'pagination:items':
            if (typeof currentValue === 'number' && [10, 20, 30, 50].includes(currentValue)) {
              pageActionsRef.current?.setItemsPerPage?.(currentValue);
            }
            break;
          case 'search:keyword':
            if (typeof currentValue === 'string' && currentValue) {
              pageActionsRef.current?.searchByKeyword?.(currentValue);
            }
            break;
          case 'sort:by':
            if (currentValue && ['default', 'points', 'comments', 'newest', 'oldest'].includes(currentValue)) {
              pageActionsRef.current?.sortByPreference?.(currentValue as 'default' | 'points' | 'comments' | 'newest' | 'oldest');
            }
            break;
          case 'filter:domain':
            if (typeof currentValue === 'string' && currentValue) {
              pageActionsRef.current?.setDomainFilter?.(currentValue);
            }
            break;
          case 'filter:domain:clear':
            pageActionsRef.current?.clearDomainFilter?.();
            break;
          case 'filter:keyword:clear':
            pageActionsRef.current?.clearKeywordFilter?.();
            break;
          case 'viewmode':
            if (currentValue && ['normal', 'compact', 'card'].includes(currentValue)) {
              pageActionsRef.current?.setViewMode?.(currentValue as 'normal' | 'compact' | 'card');
            }
            break;
          case 'fontsize':
            if (currentValue && ['small', 'normal', 'large'].includes(currentValue)) {
              pageActionsRef.current?.setFontSize?.(currentValue as 'small' | 'normal' | 'large');
            }
            break;
          case 'filter:clearall':
            pageActionsRef.current?.clearAllFilters?.();
            break;
          case 'summarize': // Added case for summarize
            console.log(`Condition matched: summarize, value: ${currentValue}`);
            if (currentValue === 'page') {
              const mainContentElement = document.querySelector('#main-scrollable-content') || document.body;
              // Cast to HTMLElement to ensure innerText is available
              const pageText = (mainContentElement as HTMLElement).innerText;
              
              console.log('Attempting to summarize page content.');
              try {
                const response = await fetch('/api/summarize', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pageContent: pageText }),
                });
                const data = await response.json();
                if (response.ok) {
                  console.log('Page summary:', data.summary);
                  setFeedback({
                    isProcessing: false,
                    command,
                    action: 'summarize:page',
                    reason: data.summary, // Display summary in the reason field
                    isSummary: true // Mark as summary
                  });
                  // Speech synthesis will be handled by the overlay
                } else {
                  console.error('Failed to summarize page:', data.error);
                  setFeedback({
                    isProcessing: false,
                    command,
                    action: 'summarize:page',
                    reason: `Failed to summarize: ${data.error}`,
                    isSummary: false // Not a summary, can auto-clear
                  }, 5000); // Display error for 5 seconds
                }
              } catch (error) {
                console.error('Error calling summarize API:', error);
                setFeedback({
                  isProcessing: false,
                  command,
                  action: 'summarize:page',
                  reason: 'Error calling summarize API.',
                  isSummary: false // Not a summary, can auto-clear
                }, 5000); // Display error for 5 seconds
              }
            } else {
              console.warn(`Unknown summarize value: ${currentValue} for action: summarize`);
            }
            break;
          case 'none':
          default:
            break;
        }
        if (data.actions.length > 1 && actionItem !== data.actions[data.actions.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
        }
      }
    } catch (error) {
      console.error('Error processing command:', error)
      setFeedback({
        isProcessing: false,
        command,
        action: 'none',
        reason: 'Error processing command'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.log('Recognition restart error:', e)
        }
      }
    }

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const command = event.results[last][0].transcript
      
      console.log('Voice command:', command)
      processCommand(command)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (isListening && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Recognition restart error:', e)
            }
          }, 100)
        }
      } else if (event.error === 'not-allowed') {
        setIsListening(false)
        alert('Microphone access denied. Please allow microphone access to use voice control.')
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [theme, pathname, conversationHistory, isListening, isProcessing])

  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.log('Start error:', e)
        }
      } else {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  return (
    <VoiceControlContext.Provider value={{ 
      isListening, 
      setIsListening, 
      isProcessing, 
      registerPageActions, 
      unregisterPageActions 
    }}>
      {children}
    </VoiceControlContext.Provider>
  )
}

export const useVoiceControl = () => {
  const context = useContext(VoiceControlContext)
  if (!context) {
    throw new Error('useVoiceControl must be used within VoiceControlProvider')
  }
  return context
}