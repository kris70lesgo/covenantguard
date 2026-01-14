import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "./client-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Credexia - AI-Driven Loan Monitoring",
  description: "AI-powered loan covenant monitoring with blockchain audit trails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
          <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
