import type { Metadata, Viewport } from "next";
import { Prompt, Geist_Mono } from "next/font/google";
import "./globals.generated.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TicketHub",
  description: "Navigating the Nebula — Smart Itinerary & Booking Synergy Platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TicketHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#1877f2",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${prompt.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-background text-on-surface">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="tickethub-theme">
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
               if ('serviceWorker' in navigator) {
                 window.addEventListener('load', function() {
                   navigator.serviceWorker.register('/sw.js').then(function(registration) {
                     console.log('ServiceWorker registration successful with scope: ', registration.scope);
                   }, function(err) {
                     console.log('ServiceWorker registration failed: ', err);
                   });
                 });
               }
             `,
          }}
        />
      </body>
    </html>
  );
}
