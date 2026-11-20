import React from 'react';
import CustomerSite from '@/components/CustomerSite';
import { getCatalog } from '@/lib/catalogStore';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const catalog = await getCatalog();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Alfa Garaj',
    image: 'https://alfagaraj-websitesi.vercel.app/logo.png',
    '@id': 'https://alfagaraj-websitesi.vercel.app',
    url: 'https://alfagaraj-websitesi.vercel.app',
    telephone: ['+905321352815', '+905347425268'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hacı Halil Mah. Adliye Cad. No:33 (Adliye Yanı)',
      addressLocality: 'Gebze',
      addressRegion: 'Kocaeli',
      postalCode: '41400',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.8021,
      longitude: 29.4307,
    },
    hasMap: 'https://maps.google.com/?q=40.8021,29.4307',
    areaServed: ['Gebze', 'Darıca', 'Çayırova', 'Dilovası', 'Tuzla', 'Kocaeli'],
    brand: ['Segway', 'ONVO'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    priceRange: '$$',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomerSite initialCatalog={catalog} initialTab="home" />
    </>
  );
}
