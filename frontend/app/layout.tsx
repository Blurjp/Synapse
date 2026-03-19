import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { FloatingSidebar } from "@/components/sidebar";
import { ConditionalFloatingSidebar } from "@/components/sidebar/ConditionalFloatingSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synapse - Where ideas connect",
  description: "AI-powered learning and creation platform",
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-touch-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <ConditionalFloatingSidebar />
        </SessionProvider>
      </body>
    </html>
  );
}
