import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { command, context } = await request.json()
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-04-17',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    })
    
    const conversationContext = context.history?.length > 0 
      ? `Previous commands: ${context.history.join(', ')}\n` 
      : ''
    
    const prompt = `
    You are a voice assistant for a website. Analyze the user's command and determine what action(s) to take.
    If the command implies multiple sequential actions, list them in the order they should be performed.
    Be aware of context and natural language variations.
    
    Available action types and their possible values:
    - "theme" (value: "dark" | "light") - e.g., "dark mode" -> { "action": "theme", "value": "dark" }
    - "navigate" (value: "home" | "about" | "back" | "forward") - e.g., "go to home page" -> { "action": "navigate", "value": "home" }
    - "scroll" (value: "top" | "bottom") - e.g., "scroll to top" -> { "action": "scroll", "value": "top" }
    - "page" (value: "refresh") - e.g., "refresh page" -> { "action": "page", "value": "refresh" }
    - "summarize" (value: "page") - e.g., "summarize page" -> { "action": "summarize", "value": "page" }
    - "navigate" (value: "top" | "new" | "best" | "ask" | "show" | "job") - e.g., "show top stories" -> { "action": "navigate", "value": "top" }
    - "pagination" (value: "next" | "prev") - e.g., "next page" -> { "action": "pagination", "value": "next" }
    - "pagination:items" (value: number) - e.g., "show 10 items" -> { "action": "pagination:items", "value": 10 }
    - "search:keyword" (value: string) - e.g., "search for react" -> { "action": "search:keyword", "value": "react" }
    - "sort:by" (value: "default" | "points" | "comments" | "newest" | "oldest") - e.g., "sort by points" -> { "action": "sort:by", "value": "points" }
    - "filter:domain" (value: string) - e.g., "filter domain github.com" -> { "action": "filter:domain", "value": "github.com" }
    - "filter:domain:clear" (no value) - e.g., "clear domain filter" -> { "action": "filter:domain:clear" }
    - "filter:keyword:clear" (no value) - e.g., "clear search" -> { "action": "filter:keyword:clear" }
    - "viewmode" (value: "normal" | "compact" | "card") - e.g., "compact view" -> { "action": "viewmode", "value": "compact" }
    - "fontsize" (value: "small" | "normal" | "large") - e.g., "large text" -> { "action": "fontsize", "value": "large" }
    - "filter:clearall" (no value) - e.g., "clear all filters" -> { "action": "filter:clearall" }
    - "none" (if no clear action)
    
    ${conversationContext}
    User's current context:
    - Current theme: ${context.theme}
    - Current page: ${context.page}
    
    User said: "${command}"
    
    Respond with JSON only. The JSON should have a top-level "actions" array and an overall "reason" string.
    Each object in the "actions" array should have an "action" field (from the available types), an optional "value" field, and a "reason_step" field explaining that specific step.
    Example for "Navigate to ask and sort by popularity":
    {
      "actions": [
        { "action": "navigate", "value": "ask", "reason_step": "Navigating to Ask HN" },
        { "action": "sort:by", "value": "points", "reason_step": "Sorting by popularity" }
      ],
      "reason": "User asked to navigate to Ask HN and sort by popularity"
    }
    Example for "Show top stories":
    {
      "actions": [
        { "action": "navigate", "value": "top", "reason_step": "Navigating to Top Stories" }
      ],
      "reason": "User asked to show top stories"
    }
    If no action can be determined, respond with: { "actions": [{ "action": "none", "reason_step": "Could not understand command" }], "reason": "Could not understand command" }
    `
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    
    const textContent = (await response.text()).trim(); // Added await and trim
    let jsonStringToParse = textContent;

    // Attempt to extract JSON from markdown code block ```json ... ```
    // The AI is prompted to return JSON only, but this handles cases where it might wrap it.
    const markdownMatch = textContent.match(/^```json\s*([\s\S]*?)\s*```$/m);
    if (markdownMatch && markdownMatch[1]) {
      jsonStringToParse = markdownMatch[1].trim();
    }
    // If not in a markdown block, jsonStringToParse remains as textContent.
    // We rely on JSON.parse to validate if it's actual JSON.

    try {
      const parsed = JSON.parse(jsonStringToParse);
      
      // Validate the expected structure of the parsed JSON
      if (!parsed.actions || !Array.isArray(parsed.actions) || parsed.actions.length === 0) {
        console.error('Invalid AI response format: "actions" array is missing, not an array, or empty. Response:', jsonStringToParse);
        return NextResponse.json({ 
          actions: [{ action: 'none', reason_step: 'AI response error: "actions" array malformed' }], 
          reason: 'AI response error: "actions" array malformed' 
        });
      }

      for (const actionItem of parsed.actions) {
        if (typeof actionItem.action !== 'string' || typeof actionItem.reason_step !== 'string') {
          console.error('Invalid AI response format: action item missing or has invalid type for "action" or "reason_step". Item:', actionItem, 'Response:', jsonStringToParse);
          return NextResponse.json({ 
            actions: [{ action: 'none', reason_step: 'AI response error: action item malformed' }], 
            reason: 'AI response error: action item malformed' 
          });
        }
      }

      return NextResponse.json(parsed);
    } catch (e: any) {
      console.error('JSON parse error message:', e.message);
      console.error('Original text from AI that caused parsing error:', textContent);
      console.error('String attempted for parsing:', jsonStringToParse);
      return NextResponse.json({ 
        actions: [{ action: 'none', reason_step: 'AI response error: Failed to parse JSON' }], 
        reason: 'AI response error: Failed to parse JSON' 
      });
    }
  } catch (error: any) {
    console.error('AI error:', error)
    return NextResponse.json({ actions: [{ action: 'none', reason_step: 'AI processing error' }], reason: 'AI processing error' }, { status: 500 })
  }
}