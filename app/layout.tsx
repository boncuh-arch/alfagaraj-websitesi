import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alfa Garaj | Gebze Elektrikli Scooter Tamiri & Yetkili Servis",
  description: "Gebze'de Onvo, Segway ve Citycoco marka elektrikli scooter tamiri, batarya onarımı, lastik değişimi ve sıfır/ikinci el satışı yapan yetkili servis.",
  keywords: "gebze elektrikli scooter tamiri, onvo yetkili servis gebze, segway tamiri kocaeli, scooter batarya tamiri gebze, citycoco servis",
  verification: {
    google: "Qqxue1O21lq5cLP1zjNuTYvM-qmHE-t66P9Bq0bgkvQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
