import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "English exercises",
  description: "Interactive English grammar practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <nav className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            <Link href="/" className="hover:underline">
              Sample
            </Link>
            <Link href="/tests" className="hover:underline">
              Tests
            </Link>
            <Link href="/admin/upload" className="hover:underline">
              Upload
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
