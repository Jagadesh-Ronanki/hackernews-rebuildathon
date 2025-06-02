'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollElement = document.getElementById('main-scrollable-content')
      if (scrollElement && scrollElement.scrollTop > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const scrollElement = document.getElementById('main-scrollable-content')
    scrollElement?.addEventListener('scroll', toggleVisibility)

    return () => {
      scrollElement?.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    const scrollElement = document.getElementById('main-scrollable-content')
    scrollElement?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 z-40 h-10 w-10 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg sm:hidden"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  )
}