import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import GlobalProviders from "./providers";

const JosefinSansBold = localFont({
  src: "../pages/fonts/JosefinSansBold.ttf",
  variable: "--font-JosefinSansBold",
});
const JosefinSansLight = localFont({
  src: "../pages/fonts/JosefinSansLight.ttf",
  variable: "--font-JosefinSansLight",
});
const JosefinSansRegular = localFont({
  src: "../pages/fonts/JosefinSansRegular.ttf",
  variable: "--font-JosefinSansRegular",
});
const JosefinSansSemibold = localFont({
  src: "../pages/fonts/JosefinSansSemibold.ttf",
  variable: "--font-JosefinSansSemibold",
});
const AspireDemibold = localFont({
  src: "../pages/fonts/AspireDemibold.ttf",
  variable: "--font-AspireDemibold",
});

export const metadata: Metadata = {
  title: "Mixly",
  description: "Ultimate Music Streamer and Downloader",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`font-JosefinSansRegular ${AspireDemibold.variable} ${JosefinSansRegular.variable} ${JosefinSansSemibold.variable} ${JosefinSansLight.variable} ${JosefinSansBold.variable}`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
