import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
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
  title: "Luminary",
  description: "Human-Centric AI-Assistant Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex h-screen antialiased bg-background text-foreground font-sans">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-auto">
          <Header />
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
