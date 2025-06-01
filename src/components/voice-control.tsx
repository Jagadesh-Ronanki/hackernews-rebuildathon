'use client'

import { useVoiceControl } from '../context/voice-control-context'

export function VoiceControl() {
  const { isListening, setIsListening } = useVoiceControl()

  return (
    <div className="fixed bottom-4 left-80 flex items-center gap-2">
      <button
        onClick={() => setIsListening(!isListening)}
        className={`px-4 py-2 rounded-md font-mono text-sm transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice control'}
      >
        {isListening ? 'STOP' : 'VOICE'}
      </button>
      {isListening && (
        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-mono animate-fade-in">
          listening...
        </div>
      )}
    </div>
  )
}