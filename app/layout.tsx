import type { Metadata, Viewport } from "next";
import { Anuphan, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./overrides.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: "variable",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TicketHub",
  description: "AI-powered travel planning and booking for flights, hotels, and smoother trip checkouts.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TicketHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#12336f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${anuphan.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-on-surface">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="tickethub-theme">
          {children}
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
