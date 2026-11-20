import type { Metadata } from 'next';
import CustomerSite from '@/components/CustomerSite';
import { getCatalog } from '@/lib/catalogStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Segway & ONVO Orijinal Yedek Parça Mağazası | Alfa Garaj Gebze',
  description:
    'Segway Ninebot ve ONVO elektrikli scooter tubeless lastik, sürücü anakart, BMS batarya ve hidrolik fren yedek parçaları.',
};

export default async function SparePartsPage() {
  const catalog = await getCatalog();
  return <CustomerSite initialCatalog={catalog} initialTab="parts" />;
}
