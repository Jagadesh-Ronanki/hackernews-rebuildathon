import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { command, context } = await request.json()
    
    // Using gemini-1.5-flash for fast voice assistant responses
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    })
    
    const conversationContext = context.history?.length > 0 
      ? `Previous commands: ${context.history.join(', ')}\n` 
      : ''
    
    const prompt = `
    You are a voice assistant for a website. Analyze the user's command and determine what action to take.
    Be aware of context and natural language variations.
    
    Available actions:
    - theme:dark (switch to dark mode - for commands like "dark mode", "too bright", "darker", "night mode")
    - theme:light (switch to light mode - for commands like "light mode", "brighter", "too dark", "day mode")
    - navigate:home (go to home page)
    - navigate:about (go to about page)
    - scroll:top (scroll to top - for commands like "go up", "top", "beginning")
    - scroll:bottom (scroll to bottom - for commands like "go down", "bottom", "end")
    - navigate:back (go back in history - for commands like "go back", "previous page")
    - navigate:forward (go forward in history - for commands like "go forward", "next page")
    - page:refresh (refresh the current page - for commands like "refresh", "reload")
    - navigate:storytype:top (navigate to top stories - for commands like "show top stories", "go to top")
    - navigate:storytype:new (navigate to new stories - for commands like "show new stories", "go to new")
    - navigate:storytype:best (navigate to best stories - for commands like "show best stories", "go to best")
    - navigate:storytype:ask (navigate to ask hn - for commands like "show ask hn", "go to ask")
    - navigate:storytype:show (navigate to show hn - for commands like "show show hn", "go to show")
    - navigate:storytype:job (navigate to jobs - for commands like "show jobs", "go to jobs")
    - pagination:next (go to the next page of stories - for commands like "next page", "show next")
    - pagination:prev (go to the previous page of stories - for commands like "previous page", "show previous")
    - pagination:items:10 (show 10 items per page - for commands like "show 10 items", "10 per page")
    - pagination:items:20 (show 20 items per page - for commands like "show 20 items", "20 per page")
    - pagination:items:30 (show 30 items per page - for commands like "show 30 items", "30 per page")
    - pagination:items:50 (show 50 items per page - for commands like "show 50 items", "50 per page")
    - search:keyword:[query] (search for stories with a keyword, e.g., "search for react" -> search:keyword:react - for commands like "search for [query]", "find [query]")
    - sort:by:default (sort stories by default - for commands like "sort by default", "default sort")
    - sort:by:points (sort stories by points - for commands like "sort by points", "most popular")
    - sort:by:comments (sort stories by comments - for commands like "sort by comments", "most comments")
    - sort:by:newest (sort stories by newest - for commands like "sort by newest", "latest stories")
    - sort:by:oldest (sort stories by oldest - for commands like "sort by oldest", "oldest stories")
    - filter:domain:[domain_name] (filter by a specific domain, e.g., "filter domain github.com" -> filter:domain:github.com)
    - filter:domain:clear (clear the domain filter - for commands like "clear domain filter")
    - filter:keyword:clear (clear the keyword/search filter - for commands like "clear search", "reset search")
    - viewmode:normal (set view mode to normal - for commands like "normal view", "default view mode")
    - viewmode:compact (set view mode to compact - for commands like "compact view")
    - viewmode:card (set view mode to card - for commands like "card view", "show as cards")
    - fontsize:small (set font size to small - for commands like "small text", "decrease font size")
    - fontsize:normal (set font size to normal - for commands like "normal text", "default font size")
    - fontsize:large (set font size to large - for commands like "large text", "increase font size")
    - filter:clearall (clear all active filters - for commands like "clear all filters", "reset filters")
    - none (if no clear action)
    
    ${conversationContext}
    User's current context:
    - Current theme: ${context.theme}
    - Current page: ${context.page}
    
    User said: "${command}"
    
    Respond with JSON only: { "action": "action_name", "reason": "brief explanation" }
    `
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[^}]+\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      } else {
        return NextResponse.json({ action: 'none', reason: 'Could not understand command' })
      }
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json({ action: 'none', reason: 'Could not parse response' })
    }
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ action: 'none', reason: 'AI processing error' }, { status: 500 })
  }
}