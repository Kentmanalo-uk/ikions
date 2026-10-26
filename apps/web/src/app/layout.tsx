import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { siteConfig } from "@/lib/site";
import { jsonLd, siteGraph } from "@/lib/structured-data";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// One variable family for display and body keeps a single font on the critical path.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Code only appears below the fold, so the mono font is not preloaded.
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false });

const DEFAULT_TITLE = "Ikions — Free Open-Source Icon Library (SVG, React, Vue, Svelte)";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Ikions",
  },
  description: siteConfig.description,
  applicationName: "Ikions",
  keywords: [...siteConfig.keywords],
  authors: [{ name: "Mike Fernandez", url: siteConfig.url }],
  creator: "Mike Fernandez",
  publisher: "Ikions",
  category: "technology",
  openGraph: {
    type: "website",
    siteName: "Ikions",
    locale: "en_US",
    title: DEFAULT_TITLE,
    description: siteConfig.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: siteConfig.description },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(siteGraph())} />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg text-ink">
        <SmoothScroll />
        <Header />
        <main id="main" className="flex-1 overflow-x-clip">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
