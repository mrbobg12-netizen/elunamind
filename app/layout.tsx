import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Eluna Mind — Smarter Learning",
  description:
    "An AI study tutor that explains step by step, turns your text into notes, quizzes you, and plans your exam week. Free to start.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
