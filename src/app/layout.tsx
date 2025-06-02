'use client'; // Add 'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../../theme/theme-provider";
import { AuthProvider } from "../context/auth-context";
import { Navbar } from "../components/navbar";
import { AIFeedbackProvider } from "../context/ai-feedback-context";
import { VoiceControlProvider } from "../context/voice-control-context";
import { AIFeedbackOverlay } from "../components/ai-feedback-overlay";
import AskPageWidget from "../components/ask-page-widget";
import "./globals.css";
import { usePathname } from "next/navigation"; // Import usePathname

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = { // Metadata should be exported from server components or statically.
//   title: {
//     default: "Hacker News",
//     template: "%s - Hacker News",
//   },
//   description: "Hacker News clone built with Next.js and TypeScript.",
//   icons: {
//     icon: "/assets/logo.png",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get current pathname

  // Determine if the AskPageWidget should be shown
  // Show on post pages, user pages, and the /ask page itself.
  const showAskPageWidget = !!pathname && 
                            (pathname.startsWith('/post/') || 
                             pathname.startsWith('/user/') || 
                             pathname === '/ask');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-orange-200/10 backdrop-blur-md h-screen overflow-hidden`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AIFeedbackProvider>
              <VoiceControlProvider>
                <div className="flex flex-col h-full">
                  <Navbar />
                  <main className="flex-1 overflow-y-auto">{children}</main>
                  {showAskPageWidget && <AskPageWidget />}
                </div>
                <AIFeedbackOverlay />
              </VoiceControlProvider>
            </AIFeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}