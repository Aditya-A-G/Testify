import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Website Performance Tester",
  description:
    "A comprehensive tool for analyzing and optimizing your website's performance across multiple regions. Test load times, first paint time, and other key metrics in real-time.",
  keywords:
    "website performance, load time, speed test, web optimization, multi-region testing, analytics, web performance metrics",
  authors: {
    name: "Aditya Anil Ghadge",
    url: "https://adityacodes.tech/",
  },
  openGraph: {
    title: "Website Performance Tester",
    description:
      "Analyze and improve your website's speed and performance globally.",
    url: "https://testify.adityacodes.tech/",
    type: "website",
    images: [
      {
        url: "https://testify.adityacodes.tech/logo.png",
        width: 800,
        height: 600,
        alt: "Website Performance Tester",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Performance Tester",
    description:
      "Test your website's performance and optimize it for better user experience.",
    images: [{ url: "https://testify.adityacodes.tech/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* <main>{children}</main> */}
        <div className="w-full h-[90vh] flex justify-center items-center">
        <h1 className="text-3xl text-center">Our service is temporarily down for maintenance and will be back online in a few hours. Thank you for your patience.</h1>

        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
