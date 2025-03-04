import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JSON a Tabla",
  description:
    "Analiza datos JSON de cualquier fuente en una tabla interactiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='flex-1'>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
