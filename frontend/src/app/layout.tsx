import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/context/Providers";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import OfflineIndicator from "@/components/OfflineIndicator";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export async function generateMetadata(): Promise<Metadata> {
  let title = "MarkatVerse | India's #1 Hyperlocal Marketplace, B2B Trade & Live Salon Booking";
  let description = "Shop local retail products, order wholesale B2B goods with verified logistics, and book appointments with live tokens at top salons & professionals across India.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://markatverse.com";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`${apiUrl}/system-config/seo`, {
          next: { revalidate: 60 },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.title) title = data.title;
          if (data?.description) description = data.description;
        }
      } catch {
        clearTimeout(timeoutId);
      }
    }
  } catch {
    // Fall back safely
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | MarkatVerse",
    },
    description,
    keywords: [
      "MarkatVerse",
      "MaratVerse",
      "MarketVerse",
      "Markat Verse",
      "Market Verse",
      "Marat Verse",
      "hyperlocal marketplace",
      "online shopping India",
      "B2B wholesale",
      "salon appointment booking",
      "live queue tokens",
      "doorstep delivery",
      "verified local sellers"
    ],
    authors: [{ name: "MarkatVerse Technologies", url: siteUrl }],
    creator: "MarkatVerse",
    publisher: "MarkatVerse",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "MarkatVerse",
      images: [
        {
          url: "/MarkatVerse Banner.png",
          width: 1200,
          height: 630,
          alt: "MarkatVerse Hyperlocal Marketplace & Services",
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/MarkatVerse Banner.png"],
      creator: "@markatverse",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "MarkatVerse",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

// Schema.org JSON-LD Structured Data
const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://markatverse.com/#organization",
      name: "MarkatVerse",
      alternateName: [
        "MaratVerse",
        "MarketVerse",
        "Markat Verse",
        "Market Verse",
        "Marat Verse",
        "Marcatverse",
        "Markatvers"
      ],
      url: "https://markatverse.com",
      logo: "https://markatverse.com/logo.png",
      description: "India's next-generation hyperlocal marketplace, wholesale B2B trade, and live appointment booking platform.",
      sameAs: [
        "https://twitter.com/markatverse",
        "https://instagram.com/markatverse"
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        availableLanguage: ["English", "Hindi"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://markatverse.com/#website",
      url: "https://markatverse.com",
      name: "MarkatVerse",
      publisher: {
        "@id": "https://markatverse.com/#organization"
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://markatverse.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Instant High-Performance Logo Preload */}
        <link rel="preload" href="/logo-optimized.webp" as="image" type="image/webp" fetchPriority="high" />
        <link rel="preload" href="/logo.png" as="image" type="image/png" fetchPriority="high" />
        {/* Google Rich Snippets / Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <Toaster position="top-right" />
          <OfflineIndicator />
          <ConditionalNavbar />
          {children}
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
