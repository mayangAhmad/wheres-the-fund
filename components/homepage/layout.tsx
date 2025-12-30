// app/layout.tsx

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Outfit, Manrope } from "next/font/google";
import "./globals.css";
import { CampaignsProvider } from "@/context/CampaignsContext"; 

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit" 
});

const manrope = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope" 
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "WheresTheFund | Transparent Funds Tracking",
  description: "Blockchain-powered donation tracking system.",
  openGraph: {
    title: "WheresTheFund",
    description: "Track every cent of your donation on the blockchain.",
    siteName: "WheresTheFund",
    images: [
      {
        url: "/wtf.svg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`
        ${inter.variable} 
        ${jakarta.variable} 
        ${outfit.variable} 
        ${manrope.variable} 
        antialiased
        font-sans
      `}>
        {/* Wrap all interactive content with the Provider */}
        <CampaignsProvider> 
          <main>{children}</main>
        </CampaignsProvider>
      </body>
    </html>
  );
}