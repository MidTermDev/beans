import type { Metadata } from "next";
import "./globals.css";
import { AppWalletProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "HATCHED - Solana Yield Protocol",
  description: "Revolutionary yield farming protocol on Solana. Buy chickens that produce eggs, hatch for compound growth, or sell for SOL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
