'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, signup } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const success = await login(username, password)
    
    if (success) {
      // Check for returnTo parameter
      const searchParams = new URLSearchParams(window.location.search)
      const returnTo = searchParams.get('returnTo') || '/'
      router.push(returnTo)
    } else {
      setError('Invalid credentials. Try root:root')
    }
    
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const email = formData.get('email') as string

    if (password.length < 3) {
      setError('Password must be at least 3 characters')
      setIsLoading(false)
      return
    }

    const success = await signup(username, password, email)
    
    if (success) {
      // Check for returnTo parameter
      const searchParams = new URLSearchParams(window.location.search)
      const returnTo = searchParams.get('returnTo') || '/'
      router.push(returnTo)
    } else {
      setError('Signup failed')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-orange-200/10 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-mono text-xl text-gray-900 dark:text-gray-100">
            HACKER NEWS
          </CardTitle>
          <CardDescription className="font-mono text-sm">
            Access your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 font-mono">
              <TabsTrigger value="signin">SIGN IN</TabsTrigger>
              <TabsTrigger value="signup">SIGN UP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-username" className="font-mono text-sm">
                    USERNAME
                  </Label>
                  <Input
                    id="signin-username"
                    name="username"
                    type="text"
                    placeholder="root"
                    required
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="font-mono text-sm">
                    PASSWORD
                  </Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="root"
                    required
                    className="font-mono"
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm font-mono">{error}</p>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-mono bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  Test credentials: root / root
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="font-mono text-sm">
                    USERNAME
                  </Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    placeholder="Enter username"
                    required
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-mono text-sm">
                    EMAIL (OPTIONAL)
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-mono text-sm">
                    PASSWORD
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    required
                    className="font-mono"
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm font-mono">{error}</p>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-mono bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}