'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  if (typeof window !== 'undefined' && !user) {
    router.push('/login?returnTo=/submit')
    return null
  }

  const handleSubmitLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const url = formData.get('url') as string

    if (!title.trim() || !url.trim()) {
      setError('Title and URL are required')
      setIsSubmitting(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    setSuccess(true)
    setIsSubmitting(false)
    e.currentTarget.reset()

    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  const handleSubmitAsk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const text = formData.get('text') as string

    if (!title.trim()) {
      setError('Title is required')
      setIsSubmitting(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    setSuccess(true)
    setIsSubmitting(false)
    e.currentTarget.reset()

    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 ">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl">SUBMIT</CardTitle>
          <CardDescription className="font-mono text-sm">
            Share a link or start a discussion
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2 font-mono mb-6">
              <TabsTrigger value="link">SHARE A LINK</TabsTrigger>
              <TabsTrigger value="ask">ASK HN / SHOW HN</TabsTrigger>
            </TabsList>

            <TabsContent value="link">
              <form onSubmit={handleSubmitLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-title" className="font-mono text-sm">
                    TITLE
                  </Label>
                  <Input
                    id="link-title"
                    name="title"
                    placeholder="Title of your submission"
                    required
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-url" className="font-mono text-sm">
                    URL
                  </Label>
                  <Input
                    id="link-url"
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    required
                    className="font-mono"
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
                {success && (
                  <p className="text-green-500 text-sm font-mono">
                    Submission successful! Redirecting to homepage...
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full font-mono bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="ask">
              <form onSubmit={handleSubmitAsk} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ask-title" className="font-mono text-sm">
                    TITLE
                  </Label>
                  <Input
                    id="ask-title"
                    name="title"
                    placeholder="Begin with 'Ask HN:' or 'Show HN:'"
                    required
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: "Ask HN: What's your favorite development tool?" or "Show HN: My weekend project"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ask-text" className="font-mono text-sm">
                    TEXT (OPTIONAL)
                  </Label>
                  <textarea
                    id="ask-text"
                    name="text"
                    rows={6}
                    placeholder="Provide details about your question or project..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
                {success && (
                  <p className="text-green-500 text-sm font-mono">
                    Submission successful! Redirecting to homepage...
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full font-mono bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="text-orange-500 hover:text-orange-600">
            ← Return to homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
