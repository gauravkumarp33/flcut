// FLCUT-AI-2627-visible
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLCut",
  description: "Internal link management for the FLCut club team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
