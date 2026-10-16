import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/context/Providers";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
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
  let title = "MARKATVERSE - Everything. Everyone. Everywhere.";
  let description = "The global marketplace connecting people, businesses and opportunities.";

  try {
    const getApiUrl = () => { if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL; if (typeof window !== 'undefined') { return 'http://' + window.location.hostname + ':3001'; } return 'http://localhost:3001'; }; const API_URL = getApiUrl();
    // Revalidate every 60 seconds so SEO updates reflect relatively quickly
    const res = await fetch(`${API_URL}/system-config/seo`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.description) description = data.description;
    }
  } catch (error) {
    console.error("Failed to fetch SEO settings:", error);
  }

  return {
    title,
    description,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Providers>
          <Toaster position="top-right" />
          <ConditionalNavbar />
          {children}
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
