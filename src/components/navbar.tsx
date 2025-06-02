'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useVoiceControl } from '../context/voice-control-context'
import { useAuth } from '../context/auth-context'
import { BsStars  } from "react-icons/bs";
import { LuSunDim, LuMoon } from "react-icons/lu";

export function Navbar() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const { isListening, setIsListening } = useVoiceControl()
    const { user, logout } = useAuth()
    const router = pathname?.startsWith('/search') ? undefined : pathname;
    
    const isActive = (path: string) => pathname === path

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    const handleLogout = () => {
        logout()
    }

    return (
        <nav className="z-50 sticky top-0 ">
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
                <div className="flex items-center justify-between h-12 sm:h-14">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-between w-full gap-x-3 lg:gap-x-6">
                        {/* Section 1 - Main Navigation */}
                        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md w-full bg-orange-100/20 dark:bg-orange-900/10 backdrop-blur-md border border-orange-200/50 dark:border-orange-900/30">
                            <Link 
                                href="/" 
                                className="flex items-center space-x-2 font-mono text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                            >
                                <img 
                                    src="/assets/logo.png" 
                                    alt="Hacker News Logo" 
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                />
                                <span>HACKER NEWS</span>
                            </Link> 
                            
                            <span className="relative group font-mono text-xs sm:text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                                | <span className="hover:text-orange-500 transition-colors">🧡</span>
                                {/* Container for flying hearts - hidden by default, shown on hover */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 hidden group-hover:block pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <span 
                                            key={i} 
                                            className="absolute text-lg text-orange-500 opacity-0 animate-fly-away-heart"
                                            style={{ 
                                                animationDelay: `${i * 0.05}s`,
                                                left: mounted ? `${Math.random() * 20 - 15}px` : '0px'
                                            }}
                                        >
                                            🧡
                                        </span>
                                    ))}
                                </div>
                            </span>
                            
                            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 ml-auto">
                                <Link 
                                    href="/saved" 
                                    className={`font-mono text-xs sm:text-sm transition-colors ${
                                        isActive('/saved') 
                                            ? 'text-orange-700 dark:text-orange-300 font-semibold' 
                                            : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
                                    }`}
                                >
                                    SAVED
                                </Link>

                                <Link 
                                    href="/submit" 
                                    className={`font-mono text-xs sm:text-sm transition-colors ${
                                        isActive('/submit') 
                                            ? 'text-orange-700 dark:text-orange-300 font-semibold' 
                                            : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
                                    }`}
                                >
                                    SUBMIT
                                </Link>
                            </div>
                        </div>

                        {/* Search Box */}
                        <form onSubmit={handleSearch} className="flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-48 lg:w-64 px-3 py-1.5 sm:py-2 pr-8 sm:pr-10 font-mono text-xs sm:text-sm bg-orange-100/20 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </form>

                        {/* Voice Control & Theme Toggle */}
                        <div className="flex items-center space-x-2">
                            {/* Voice Control */}
                            <button
                                onClick={() => setIsListening(!isListening)}
                                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                                    isListening 
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                        : 'bg-orange-100 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400'
                                }`}
                                title={isListening ? 'Stop listening' : 'Start voice control'}
                                aria-label={isListening ? 'Stop listening' : 'Start voice control'}
                            >
                                <BsStars  className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            {/* Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-1.5 sm:p-2 rounded-md bg-orange-100 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
                                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                >
                                    {theme === 'dark' ? (
                                        <LuSunDim className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    ) : (
                                        <LuMoon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Section 2 - User Actions */}
                        <div className="flex items-center space-x-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono text-xs sm:text-sm text-white">
                                        {user.username}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="font-mono text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    href="/login" 
                                    className="font-mono text-xs sm:text-sm text-white/90 hover:text-white transition-colors"
                                >
                                    LOGIN
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center justify-between w-full py-2">
                        <Link 
                            href="/" 
                            className="flex items-center font-mono text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        >
                            <img 
                                src="/assets/logo.png" 
                                alt="Hacker News Logo" 
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5"
                            />
                            <span>HN</span>
                        </Link>
                        
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mx-2 flex-1 max-w-[60%]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full px-2 py-1 text-xs bg-orange-100/20 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                        
                        <div className="flex items-center space-x-1.5">
                            {/* Mobile Voice Control */}
                            <button
                                onClick={() => setIsListening(!isListening)}
                                className={`p-1 rounded-md transition-colors ${
                                    isListening 
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                        : 'bg-orange-100 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                                }`}
                                title={isListening ? 'Stop listening' : 'Start voice control'}
                                aria-label={isListening ? 'Stop listening' : 'Start voice control'}
                            >
                                <BsStars  className="w-3 h-3" />
                            </button>

                            {/* Mobile Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-1 rounded-md bg-orange-100 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-500"
                                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                >
                                    {theme === 'dark' ? (
                                        <LuSunDim className="w-3 h-3" />
                                    ) : (
                                        <LuMoon className="w-3 h-3" />
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="font-mono text-[9px] sm:text-[10px] bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 py-1 px-1.5 rounded text-white transition-colors"
                                aria-expanded={isMenuOpen}
                                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            >
                                {isMenuOpen ? 'CLOSE' : 'MENU'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-[48px] left-0 right-0 z-50 bg-orange-50 backdrop-blur-md border-b border-orange-200/30 dark:border-orange-900/20 shadow-lg">
                        <div className="flex flex-col">
                            <Link 
                                href="/news" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/news') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                NEWS
                            </Link>
                            
                            <Link 
                                href="/ask" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/ask') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                ASK
                            </Link>
                            
                            <Link 
                                href="/show" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/show') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                SHOW
                            </Link>
                            
                            <Link 
                                href="/jobs" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/jobs') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                JOBS
                            </Link>
                            
                            <Link 
                                href="/saved" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/saved') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                SAVED
                            </Link>

                            <Link 
                                href="/submit" 
                                className={`px-4 py-2.5 font-mono text-xs border-l-2 transition-colors ${
                                    isActive('/submit') 
                                        ? 'bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-l-orange-500' 
                                        : 'text-gray-600 dark:text-gray-400 border-l-transparent hover:bg-orange-50/50 dark:hover:bg-orange-900/5 hover:text-orange-600 dark:hover:text-orange-400'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                SUBMIT
                            </Link>
                            
                            <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                                {user ? (
                                    <div className="flex justify-between items-center px-4 py-2.5">
                                        <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                                            {user.username}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                handleLogout()
                                                setIsMenuOpen(false)
                                            }}
                                            className="font-mono text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
                                        >
                                            LOGOUT
                                        </button>
                                    </div>
                                ) : (
                                    <Link 
                                        href="/login" 
                                        className="block font-mono text-xs px-4 py-2.5 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        LOGIN
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}