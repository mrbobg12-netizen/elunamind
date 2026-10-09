import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import { ErrorReporter } from "./_components/ErrorCatcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Bricolage Grotesque for display: engineered letterforms with a little grit,
// which suits a mark built from circuitry. Inter carries everything else.
const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#05060e",
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
      <body className={`${inter.variable} ${display.variable} antialiased`}>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}
