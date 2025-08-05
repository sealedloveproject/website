import type { Metadata } from "next";
import { Playfair_Display, Barlow } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import SignInModal from "@/components/auth/SignInModal";
import { SessionProvider } from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

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

export const metadata: Metadata = {
  title: "sealed.love project",
  description: "sealed.love - a personal project by Alex & Ioana",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = (await getLocale()) || 'en';

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
                <NextIntlClientProvider>
                  <Navigation />
                  <main className="flex-grow mt-12">
                    {children}
                  </main>
                  <Footer />
                </NextIntlClientProvider>
              </div>
              <SignInModal />
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
