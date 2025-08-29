import type { Metadata } from "next";
import { Playfair_Display, Barlow } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { createMetadata } from '@/lib/metadata';
import { AuthProvider } from "@/contexts/AuthContext";
import SignInModal from "@/components/auth/SignInModal";
import { SessionProvider } from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = createMetadata('/', {
  title: "Sealed Love Project | Preserve Your Love Stories Forever",
  description: "Create, preserve, and share your love stories for generations to come. Sealed Love Project offers secure, timeless digital preservation of your most precious romantic memories and milestones.",
  openGraph: {
    title: "Sealed Love Project",
    description: "Preserve your love stories for generations to come",
    siteName: "Sealed Love Project",
    images: [
      {
        url: `https://${process.env.DOMAIN}/images/og-home.png`,
        width: 1200,
        height: 630,
        alt: "Sealed Love Project",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sealed Love Project",
    description: "Preserve your love stories for generations to come",
    images: [`https://${process.env.DOMAIN}/images/og-home.png`],
  },
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = (await getLocale()) || 'en';
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${playfair.variable} ${barlow.variable} antialiased text-foreground`}
      >
        <ThemeProvider>
          <SessionProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <div className="texture-background"></div>
                <NextIntlClientProvider locale={locale} messages={messages}>
                  <Navigation />
                  <main className="flex-grow mt-12">
                    {children}
                  </main>
                  <Footer />
                  <SignInModal />
                </NextIntlClientProvider>
              </div>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
