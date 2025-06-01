'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { useAIFeedback } from './ai-feedback-context'

interface VoiceControlContextType {
  isListening: boolean
  setIsListening: (listening: boolean) => void
  isProcessing: boolean
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
        action: data.action,
        reason: data.reason
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (data.action) {
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
          window.scrollTo({ top: 0, behavior: 'smooth' })
          break
        case 'scroll:bottom':
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          break
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
    <VoiceControlContext.Provider value={{ isListening, setIsListening, isProcessing }}>
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