'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AIFeedback {
  isProcessing: boolean
  command: string
  action: string
  reason: string
}

interface AIFeedbackContextType {
  feedback: AIFeedback
  setFeedback: (feedback: AIFeedback) => void
  clearFeedback: () => void
}

const AIFeedbackContext = createContext<AIFeedbackContextType | undefined>(undefined)

export function AIFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<AIFeedback>({
    isProcessing: false,
    command: '',
    action: '',
    reason: ''
  })

  const clearFeedback = () => {
    setFeedback({
      isProcessing: false,
      command: '',
      action: '',
      reason: ''
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