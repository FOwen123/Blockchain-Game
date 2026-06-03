import type { Metadata, Viewport } from "next";
import { Oxanium, Sora } from "next/font/google";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-oxanium",
  display: "swap"
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Tokyo Chain Rally",
  description: "A phone-first racing quiz for the Financial Blockchain course."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#161724"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${oxanium.variable}`}>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
