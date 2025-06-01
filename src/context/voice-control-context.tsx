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
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      for (const actionItem of data.actions) {
        const currentAction = actionItem.action;
        const currentValue = actionItem.value;

        // Existing switch cases will be adapted to use currentAction and currentValue
        switch (currentAction) {
          case 'theme:dark':
            setTheme('dark')
            break
          case 'theme:light':
            setTheme('light')
            break
          case 'navigate:home':
            router.push('/')
            break
          case 'navigate:about':
            router.push('/about')
            break
          case 'scroll:top':
            {
              const mainScrollable = document.getElementById('main-scrollable-content');
              if (mainScrollable) {
                mainScrollable.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
            break
          case 'scroll:bottom':
            {
              const mainScrollable = document.getElementById('main-scrollable-content');
              if (mainScrollable) {
                mainScrollable.scrollTo({ top: mainScrollable.scrollHeight, behavior: 'smooth' });
              }
            }
            break
          case 'navigate:back':
            router.back()
            break
          case 'navigate:forward':
            router.forward()
            break
          case 'page:refresh':
            window.location.reload()
            break
          case 'navigate:storytype':
            if (currentValue && ['top', 'new', 'best', 'ask', 'show', 'job'].includes(currentValue)) {
              router.push(`/?type=${currentValue}`)
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
            break
          case 'search:keyword':
            if (typeof currentValue === 'string' && currentValue) {
              pageActionsRef.current?.searchByKeyword?.(currentValue);
            }
            break
          case 'sort:by':
            if (currentValue && ['default', 'points', 'comments', 'newest', 'oldest'].includes(currentValue)) {
              pageActionsRef.current?.sortByPreference?.(currentValue as 'default' | 'points' | 'comments' | 'newest' | 'oldest');
            }
            break
          case 'filter:domain':
            if (typeof currentValue === 'string' && currentValue) {
              pageActionsRef.current?.setDomainFilter?.(currentValue);
            }
            break
          case 'filter:domain:clear':
            pageActionsRef.current?.clearDomainFilter?.();
            break
          case 'filter:keyword:clear':
            pageActionsRef.current?.clearKeywordFilter?.();
            break
          case 'viewmode':
            if (currentValue && ['normal', 'compact', 'card'].includes(currentValue)) {
              pageActionsRef.current?.setViewMode?.(currentValue as 'normal' | 'compact' | 'card');
            }
            break
          case 'fontsize':
            if (currentValue && ['small', 'normal', 'large'].includes(currentValue)) {
              pageActionsRef.current?.setFontSize?.(currentValue as 'small' | 'normal' | 'large');
            }
            break
          case 'filter:clearall':
            pageActionsRef.current?.clearAllFilters?.();
            break
          case 'none':
          default:
            // No operation for "none" or unknown actions in a sequence
            break;
        }
        // Add a small delay between actions if needed, e.g., for navigation to complete
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