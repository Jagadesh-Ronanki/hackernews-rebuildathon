'use client'

import { useEffect } from 'react'
import { useAIFeedback } from '../context/ai-feedback-context'

export function AIFeedbackOverlay() {
  const { feedback, clearFeedback } = useAIFeedback()

  useEffect(() => {
    if (feedback.action && !feedback.isProcessing) {
      const timer = setTimeout(() => {
        clearFeedback()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [feedback, clearFeedback])

  if (!feedback.isProcessing && !feedback.action) return null

  const getActionText = (action: string) => {
    switch (action) {
      case 'theme:dark': return 'THEME: DARK'
      case 'theme:light': return 'THEME: LIGHT'
      case 'navigate:home': return 'NAV: HOME'
      case 'navigate:about': return 'NAV: ABOUT'
      case 'scroll:top': return 'SCROLL: TOP'
      case 'scroll:bottom': return 'SCROLL: BOTTOM'
      case 'none': return 'NO ACTION'
      default: return 'PROCESSING'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Blurry background */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
      
      {/* Feedback card */}
      <div className="relative bg-orange-200/10 backdrop-blur-md border border-orange-200/50 dark:border-orange-900/30 rounded-md p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        {feedback.isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-2 border-gray-800 dark:border-gray-200 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-mono text-center mb-2 text-gray-900 dark:text-gray-100">
              PROCESSING
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center font-mono text-sm">
              "{feedback.command}"
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-mono text-center mb-4 text-gray-900 dark:text-gray-100">
              {getActionText(feedback.action)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center font-mono text-sm">
              {feedback.reason}
            </p>
          </>
        )}
      </div>
    </div>
  )
}