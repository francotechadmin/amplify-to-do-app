import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "./components/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo app built with Next.js and AWS Amplify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en" className="h-[100dvh] m-0">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#10121E] w-screen h-[100dvh]  m-0`}
        >
          <main className="flex flex-col items-center w-full h-[100dvh]">
            {children}
          </main>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
