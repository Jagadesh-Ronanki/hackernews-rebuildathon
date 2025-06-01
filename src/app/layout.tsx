import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../../theme/theme-provider";
import { AuthProvider } from "../context/auth-context";
import { Navbar } from "../components/navbar";
import { AIFeedbackProvider } from "../context/ai-feedback-context";
import { VoiceControlProvider } from "../context/voice-control-context";
import { AIFeedbackOverlay } from "../components/ai-feedback-overlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hacker News",
    template: "%s - Hacker News",
  },
  description: "Hacker News clone built with Next.js and TypeScript.",
  icons: {
    icon: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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