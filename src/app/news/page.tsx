'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-orange-200/10 backdrop-blur-md flex items-center justify-center">
      <div className="font-mono text-gray-600 dark:text-gray-400">Redirecting to home...</div>
    </div>
  )
}
