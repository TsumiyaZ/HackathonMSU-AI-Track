import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="th" className={`${inter.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
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
