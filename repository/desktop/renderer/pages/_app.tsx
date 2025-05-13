import "./globals.css";
import React from "react";
import type { AppProps } from "next/app";
import LocalFontLoader from "next/font/local";
const Lobster = LocalFontLoader({ variable: "--font-Lobster", src: "../fonts/Lobster.ttf" });
const Markazi = LocalFontLoader({ variable: "--font-Markazi", src: "../fonts/Markazi.ttf" });
function core({ Component, pageProps }: AppProps) {
  return (
    <main className={`${Lobster.variable} ${Markazi.variable} antialiased font-Lobster`}>
      <Component {...pageProps} />
    </main>
  );
}
export default core;
