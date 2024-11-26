import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WagmiProvider } from "./providers/wagmi";
import { ReactQueryProvider } from "./providers/react-query";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "V2 Frame Swap",
  description: "Brought by your favorite client",
};

export default function RootLayout({
  children,
  frameSdkLoader,
  wallet,
  frameContext
}: Readonly<{
  children: React.ReactNode;
  frameSdkLoader: React.ReactNode;
  wallet: React.ReactNode;
  frameContext: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider>
          <ReactQueryProvider>
            {frameContext}
            {wallet}
            {children}
            {frameSdkLoader}
          </ReactQueryProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
