'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiChevronLeft } from 'react-icons/fi'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen backdrop-blur-md text-gray-900 dark:text-gray-100">
      {/* Back button header */}
      <header className="md:sticky top-0 z-10">
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
          <p>Built with <span className="relative group inline-block cursor-pointer"><span className="hover:text-orange-500 transition-colors">🧡</span><span className="absolute -top-2 left-1/2 -translate-x-1/2 hidden group-hover:block pointer-events-none">{[...Array(5)].map((_, i) => (<span key={i} className="absolute text-lg text-orange-500 opacity-0 animate-fly-away-heart" style={{ animationDelay: `${i * 0.05}s`, left: `${Math.random() * 20 - 10}px` }}>🧡</span>))}</span></span> by Jagadesh Ronanki</p>
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
