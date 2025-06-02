import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set. The Generative AI model will not be initialized.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" }) : null;

export async function POST(request: Request) {
    if (!model) {
        return NextResponse.json(
            { error: "Generative AI model not initialized. Check if GEMINI_API_KEY is set." },
            { status: 500 }
        );
    }

    try {
        const { comments, pageContent } = await request.json();

        if (pageContent && typeof pageContent === 'string') {
            // Summarize page content
            const prompt = `Please summarize the following page content. Provide a concise overview of the main topics and key information. The summary should be neutral and informative.

            Page Content:
            ${pageContent}

            Summary:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summary = await response.text();
            return NextResponse.json({ summary });

        } else if (comments && Array.isArray(comments) && !comments.some(c => typeof c !== 'string')) {
            // Summarize comments (existing functionality)
            if (comments.length === 0) {
                return NextResponse.json(
                    { summary: "There are no comments to summarize." },
                    { status: 200 }
                );
            }

            const commentsText = comments.join("\n\n---\n\n");

            const prompt = `Please summarize the following discussion from a Hacker News comment section. Provide a concise overview of the main topics, opinions, and any conclusions drawn. The summary should be neutral and informative.

            Comments:
            ${commentsText}

            Summary:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summary = await response.text();
            return NextResponse.json({ summary });
        } else {
            return NextResponse.json(
                { error: "Invalid input: please provide either 'comments' (array of strings) or 'pageContent' (string)." },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error("Error in POST /api/summarize:", error);
        return NextResponse.json(
            { error: "Failed to process request.", details: error.message },
            { status: 500 }
        );
    }
}
