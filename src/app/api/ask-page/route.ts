import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set. The Generative AI model will not be initialized.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
// Model configuration for safety settings - can be adjusted as needed
const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(request: Request) {
  if (!genAI) {
    return NextResponse.json(
      { error: "Generative AI model not initialized. Check if GEMINI_API_KEY is set." },
      { status: 500 }
    );
  }

  try {
    const { pageContent, question, history } = await request.json();

    if (typeof pageContent !== 'string' || typeof question !== 'string') {
      return NextResponse.json(
        { error: "Invalid input: pageContent and question must be strings." },
        { status: 400 }
      );
    }

    if (!question.trim()) { // pageContent can be empty if it's a general question
      return NextResponse.json(
        { error: "Invalid input: question cannot be empty." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-04-17",
      generationConfig,
      safetySettings,
    });

    // Construct the initial prompt part that sets the context
    const systemInstruction = `You are a helpful AI assistant integrated into a Hacker News client application. 
    The user is currently viewing a page. If the following page content is not empty, use it as primary context for your answers. If it is empty, or the question is unrelated, answer as a general helpful assistant.
    ---BEGIN PAGE CONTENT (if any)---
    ${pageContent || "(No specific page content provided for this query)"}
    ---END PAGE CONTENT---

    **Special Instructions for Hacker News Entities:**
    - **User Profiles**: If the user asks to see a user's profile, or asks a question about a user that implies wanting to see their profile (e.g., "show me [username]'s profile", "who is [username]?", "link to [username]", "tell me about [username]"), you MUST try to extract the username. If a username is found (e.g., 'ani_obsessive', 'susam', '0xrj'), respond with a markdown link in the format: \`You can view [username]'s profile on this site: [/user/[username]](/user/[username])\`. Replace \`[username]\` with the actual username found in the user's query. Do not state that you cannot find it if the username is in the query.
    - **Story/Item Pages**: If the user asks for a story, post, or item by its ID (e.g., "show me story [id]", "item [id]", "post [id]"), you MUST try to extract the ID. If an ID (a number) is found, respond with a markdown link in the format: \`You can view item #[id] on this site: [/post/[id]](/post/[id])\`. Replace \`[id]\` with the actual item ID found in the user's query.
    - **Ambiguity**: If the question is ambiguous (e.g., the username or ID is unclear or missing) or you cannot confidently extract the necessary identifier, then ask for clarification. Do not provide a broken link or incorrect information.
    - **General Questions**: For all other questions, provide a concise and informative answer based on the provided page content or your general knowledge. If the question cannot be answered from the page content, clearly state that.
    - **Confidence**: Do not make up information or URLs if you are not confident. If a username or ID is clearly present in the user's request for a profile or item, you should be confident in forming the link as instructed.

    Prioritize answering based on the page content if relevant. However, if the question is a specific request for a link to a user profile or an item page within this application, and you can form a valid internal link as per the formats above, please provide it.`;

    // The history format from the client is { role: 'user' | 'model', parts: [{ text: string }] }
    const chat: ChatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Understood. I will use the provided page content as context for my answers. If the content is not relevant or not provided, I will answer generally. How can I help?" }] },
            ...(history || []).map((msg: any) => ({ // Ensure history items are correctly formatted
                role: msg.role,
                parts: msg.parts.map((part: any) => ({ text: part.text }))
            }))
        ]
    });

    const result = await chat.sendMessage(question);
    const response = result.response;
    const answer = response.text();

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error("Error answering question:", error);
    let errorMessage = "Failed to answer question.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    // Check for specific Gemini safety blocks
    if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
        errorMessage = `Request blocked due to: ${error.response.promptFeedback.blockReason}`;
        if (error.response.promptFeedback.safetyRatings) {
            errorMessage += ` Ratings: ${JSON.stringify(error.response.promptFeedback.safetyRatings)}`;
        }
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
