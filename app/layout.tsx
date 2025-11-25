import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "@coinbase/onchainkit/styles.css"
import { Providers } from "./providers"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://funnies-app.vercel.app"),
  title: "funnies",
  description: "Claim your exclusive NFT if you have a Farcaster ID",
  generator: "v0.app",
  alternates: { canonical: "/" },
  openGraph: {
    title: "funnies",
    description: "NFT airdrop for early Farcaster supporters on Base.",
    url: "https://funnies-app.vercel.app",
    siteName: "funnies",
    type: "website",
    images: [
      {
        url: "/images/og/og-1200x630.png",
        width: 1200,
        height: 630,
        alt: "funnies NFT airdrop on Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "funnies",
    description: "NFT airdrop for early Farcaster supporters on Base.",
    images: ["/images/og/og-1200x630.png"],
  },
  other: {
    // Farcaster Mini App embed metadata for sharing/preview tools
    "fc:miniapp": JSON.stringify({
      version: "1",
      title: "Funnies on Base",
      subtitle: "Mint random Funnies on Base",
      description: "Mint a random Funnies NFT on Base mainnet for eligible Farcaster FIDs.",
      imageUrl: "https://funnies-app.vercel.app/images/og/og-1200x630.png",
      button: {
        title: "Open Funnies",
        action: {
          type: "launch_frame",
          name: "Funnies",
          url: "https://funnies-app.vercel.app",
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
