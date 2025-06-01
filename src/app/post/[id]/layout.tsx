'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiChevronLeft } from 'react-icons/fi'

export default function PostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen backdrop-blur-md text-gray-900 dark:text-gray-100">
      {/* Back button header */}
      <header className="sticky top-0 z-10 ">
        <div className="container mx-auto px-4 py-2">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <FiChevronLeft className="mr-1" size={16} />
            Back to Hacker News
          </Link>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-orange-200/10 backdrop-blur-md border-t border-orange-200/30 dark:border-orange-900/20 py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with 🧡 by Jagadesh Ronanki </p>
          <p className="mt-1">
            <Link href="/" className="text-orange-600 dark:text-orange-400 hover:underline">
              Return Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
