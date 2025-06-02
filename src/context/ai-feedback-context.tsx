'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AIFeedback {
  isProcessing: boolean
  command: string
  action: string
  reason: string
  isSummary?: boolean // Added isSummary flag
}

interface AIFeedbackContextType {
  feedback: AIFeedback
  setFeedback: (feedback: AIFeedback, duration?: number) => void
  clearFeedback: () => void
}

const AIFeedbackContext = createContext<AIFeedbackContextType | undefined>(undefined)

export function AIFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, _setFeedback] = useState<AIFeedback>({
    isProcessing: false,
    command: '',
    action: '',
    reason: '',
    isSummary: false // Initialize isSummary
  })
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const setFeedback = (newFeedback: AIFeedback, duration?: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    _setFeedback(newFeedback);
    // Only set a timeout if it's not a summary and a duration is provided
    if (!newFeedback.isSummary && duration) {
      const newTimeoutId = setTimeout(() => {
        clearFeedback();
      }, duration);
      setTimeoutId(newTimeoutId);
    } else if (newFeedback.isSummary && timeoutId) {
      // If it is a summary, clear any existing timeout to make it persistent
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const clearFeedback = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    _setFeedback({
      isProcessing: false,
      command: '',
      action: '',
      reason: '',
      isSummary: false // Reset isSummary on clear
    })
  }

  return (
    <AIFeedbackContext.Provider value={{ feedback, setFeedback, clearFeedback }}>
      {children}
    </AIFeedbackContext.Provider>
  )
}

export const useAIFeedback = () => {
  const context = useContext(AIFeedbackContext)
  if (!context) {
    throw new Error('useAIFeedback must be used within AIFeedbackProvider')
  }
  return context
}