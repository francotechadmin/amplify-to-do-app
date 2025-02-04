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
      <html lang="en">
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes"></meta>
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta content="True" name="HandheldFriendly" />
          <meta
            name="viewport"
            content="width=device-width, minimum-scale=1.0, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
          />
          <link
            rel="apple-touch-icon"
            href="/apple-touch-icon.png"
            sizes="57x57"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#10121E] w-screen m-0 min-h-[100dvh]`}
        >
          <main className="flex flex-col items-center w-full min-h-[100dvh]">
            {children}
          </main>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
