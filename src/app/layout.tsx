import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Anubis Avatar Alchemist",
  description: "Create your Anubis Dog AI Avatar",
  openGraph: {
    title: "Anubis Avatar Alchemist",
    description: "Create your Anubis Dog AI Avatar",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Anubis Dog AI",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
