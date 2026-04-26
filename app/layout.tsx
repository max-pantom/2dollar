import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { MobileSearchDock } from "@/components/mobile-search-dock"
import { ModeBoot, ModeProvider } from "@/components/mode-provider"
import { SceneOverlays, SceneTape } from "@/components/scene-overlays"
import { ThemeProvider } from "@/components/theme-provider"
import { Agentation } from "agentation"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "2dollardomain — find the domain before the motivation leaves",
    template: "%s — 2dollardomain",
  },
  description:
    "Search any idea and find cheap available domains around $2. Live availability via RDAP. Real Porkbun pricing. Renewal price always shown.",
  applicationName: "2dollardomain",
  keywords: [
    "$2 domains",
    "cheap domain names",
    "domain search",
    "domain availability",
    "porkbun pricing",
    "side project domain",
    "weekend domain",
  ],
  openGraph: {
    type: "website",
    siteName: "2dollardomain",
    url: siteUrl,
    title: "2dollardomain — find the domain before the motivation leaves",
    description:
      "Cheap available domains around $2. Live availability. Renewal price always shown.",
  },
  twitter: {
    card: "summary_large_image",
    title: "2dollardomain — find the domain before the motivation leaves",
    description:
      "Cheap available domains around $2. Live availability. Renewal price always shown.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-mode="calm"
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <head>
        <ModeBoot />
      </head>
      <body className="pb-[calc(env(safe-area-inset-bottom)+56px)] md:pb-0">
        <ThemeProvider>
          <ModeProvider>
            <SceneTape position="top" />
            <div className="relative z-10">{children}</div>
            <SceneTape position="bottom" />
            <SceneOverlays />
            <KeyboardShortcuts />
            <MobileSearchDock />
            {process.env.NODE_ENV === "development" && <Agentation />}
          </ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
