import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Anubis Dog AI",
  description: "Create your Anubis Dog AI Avatar",
  openGraph: {
    title: "Anubis Dog AI",
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
    <html lang="en" className={`${orbitron.variable} dark`}>
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
