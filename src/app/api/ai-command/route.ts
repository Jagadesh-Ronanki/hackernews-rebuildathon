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