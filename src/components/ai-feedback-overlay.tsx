'use client'

import { useEffect, useState, useRef } from 'react'
import { useAIFeedback } from '../context/ai-feedback-context'
import { Button } from './ui/button'
import { Play, Pause, X, Maximize2, Minimize2 } from 'lucide-react'

export function AIFeedbackOverlay() {
  const { feedback, clearFeedback } = useAIFeedback()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSummaryFullScreen, setIsSummaryFullScreen] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);

  useEffect(() => {
    setSpeechSynthesisSupported('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined');
  }, []);

  useEffect(() => {
    // Auto-clear non-summary feedback
    if (feedback.action && !feedback.isProcessing && !feedback.isSummary) {
      const timer = setTimeout(() => {
        clearFeedback()
      }, 3000) // Default 3s for non-summary, non-processing feedback
      return () => clearTimeout(timer)
    }
  }, [feedback, clearFeedback])

  // Speech synthesis effect
  useEffect(() => {
    if (speechSynthesisSupported && feedback.isSummary && feedback.reason) {
      // Stop any currently playing speech before starting a new one
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const newUtterance = new SpeechSynthesisUtterance(feedback.reason);
      newUtterance.onend = () => setIsPlaying(false);
      newUtterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsPlaying(false);
      };
      utteranceRef.current = newUtterance;
      // Do not auto-play, let user click play
      setIsPlaying(false); 
    } else {
      // If not a summary or no reason, ensure no utterance is active
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
      setIsPlaying(false);
    }

    // Cleanup speech on component unmount or when feedback changes significantly
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      utteranceRef.current = null;
    };
  }, [feedback.isSummary, feedback.reason, speechSynthesisSupported]);

  const handlePlayPause = () => {
    if (!utteranceRef.current || !speechSynthesisSupported) return;

    if (isPlaying) {
      window.speechSynthesis.pause(); // Pauses the current speech
      setIsPlaying(false);
    } else {
      // If paused, resume. Otherwise, speak from the beginning.
      if (window.speechSynthesis.paused && utteranceRef.current) {
        window.speechSynthesis.resume();
      } else {
        // Cancel any existing speech (even if it's a different utterance that got stuck)
        window.speechSynthesis.cancel(); 
        window.speechSynthesis.speak(utteranceRef.current);
      }
      setIsPlaying(true);
    }
  };
  
  const handleCloseSummary = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsSummaryFullScreen(false); // Reset full screen on close
    utteranceRef.current = null;
    clearFeedback();
  }

  if (!feedback.isProcessing && !feedback.action) return null

  const getActionText = (action: string) => {
    if (feedback.isSummary) return 'PAGE SUMMARY';
    switch (action) {
      case 'theme:dark': return 'THEME: DARK'
      case 'theme:light': return 'THEME: LIGHT'
      case 'navigate:home': return 'NAV: HOME'
      case 'navigate:about': return 'NAV: ABOUT'
      case 'scroll:top': return 'SCROLL: TOP'
      case 'scroll:bottom': return 'SCROLL: BOTTOM'
      case 'none': return 'NO ACTION'
      default: return action.toUpperCase();
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-auto ${feedback.isSummary && isSummaryFullScreen ? '' : 'bg-black/30 backdrop-blur-sm'}`}>
      <div className={`relative ${feedback.isSummary && isSummaryFullScreen ? 'w-full h-full bg-orange-50 dark:bg-neutral-900 rounded-none shadow-none border-none' : 'bg-orange-50 dark:bg-neutral-900/50 backdrop-blur-lg border border-orange-300/70 dark:border-orange-700/50 rounded-lg shadow-2xl max-w-lg w-full mx-4'} p-6 animate-in fade-in zoom-in-95 duration-300 flex flex-col`}>
        {feedback.isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-2 border-gray-800 dark:border-gray-200 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-mono text-center mb-2 text-gray-900 dark:text-gray-100">
              PROCESSING
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center font-mono text-sm">
              "{feedback.command}"
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold font-mono text-gray-900 dark:text-gray-100">
                {getActionText(feedback.action)}
              </h3>
              {feedback.isSummary && (
                <div className="flex items-center gap-1"> {/* Button group for summary controls */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSummaryFullScreen(!isSummaryFullScreen)} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1"
                    aria-label={isSummaryFullScreen ? 'Collapse summary' : 'Expand summary'}
                  >
                    {isSummaryFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleCloseSummary} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1"
                    aria-label="Close summary"
                  >
                    <X size={20} />
                  </Button>
                </div>
              )}
            </div>
            
            {feedback.isSummary ? (
              <div className={`space-y-4 ${isSummaryFullScreen ? 'flex-grow flex flex-col min-h-0' : ''}`}> {/* Added min-h-0 for flex-grow in Safari */}
                <div className={` ${isSummaryFullScreen ? 'flex-grow overflow-y-auto min-h-0' : 'max-h-60 overflow-y-auto'} p-3 bg-white/50 dark:bg-black/20 rounded-md border border-orange-200/30 dark:border-orange-800/30 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-200/50`}>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {feedback.reason}
                  </p>
                </div>
                {speechSynthesisSupported && feedback.reason && (
                  <div className="flex items-center justify-center mt-4">
                    <Button onClick={handlePlayPause} variant="outline" className="flex items-center gap-2 bg-orange-100/50 hover:bg-orange-200/70 dark:bg-orange-800/30 dark:hover:bg-orange-700/50 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-200">
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      <span>{isPlaying ? 'Pause' : 'Play Summary'}</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-center font-mono text-sm">
                {feedback.reason}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}