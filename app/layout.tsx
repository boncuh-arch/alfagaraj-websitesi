import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alfa Garaj | Gebze Segway & ONVO Elektrikli Scooter Servis, Yedek Parça ve Satış',
  description:
    "Gebze'de Segway ve ONVO elektrikli scooter tamiri, canlı servis takip, orijinal yedek parça satışı, batarya BMS onarımı ve sıfır / garantili 2. el scooter mağazası.",
  keywords:
    'gebze elektrikli scooter tamiri, onvo yetkili servis gebze, segway servis gebze, segway tamiri kocaeli, onvo yedek parça, segway yedek parça, ikinci el elektrikli scooter gebze, scooter batarya tamiri gebze',
  verification: {
    google: 'Qqxue1O21lq5cLP1zjNuTYvM-qmHE-t66P9Bq0bgkvQ',
  },
  openGraph: {
    title: 'Alfa Garaj | Gebze Segway & ONVO Elektrikli Scooter Servis ve Mağaza',
    description:
      "Gebze'de Segway ve ONVO elektrikli scooter teknik servisi, yedek parça satışı, canlı servis sorgulama ve sıfır/ikinci el scooter mağazası.",
    url: 'https://alfagaraj-websitesi.vercel.app',
    siteName: 'Alfa Garaj',
    images: [
      {
        url: 'https://alfagaraj-websitesi.vercel.app/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        {/* Vercel Web Analytics (Panelden Enable Analytics açıldığında otomatik izler) */}
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
