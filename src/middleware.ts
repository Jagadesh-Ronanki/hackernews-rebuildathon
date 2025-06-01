import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get user from cookie or header (for client-side we'll handle this differently)
  const isAuthPage = request.nextUrl.pathname === '/login'
  
  // For demo purposes, we'll handle auth client-side
  // In production, you'd check server-side cookies/tokens here
  
  if (isAuthPage) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/ask',
    '/submit',
    '/saved'
  ]
}