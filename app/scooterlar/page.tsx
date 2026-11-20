import type { Metadata } from 'next';
import CustomerSite from '@/components/CustomerSite';
import { getCatalog } from '@/lib/catalogStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sıfır & Garantili 2. El Segway ve ONVO Scooterlar | Alfa Garaj Gebze',
  description:
    'Alfa Garaj Gebze mağazasında sıfır kapalı kutu ve 6 ay garantili ekspertizli ikinci el Segway Ninebot ve ONVO elektrikli scooter modelleri.',
};

export default async function ScootersPage() {
  const catalog = await getCatalog();
  return <CustomerSite initialCatalog={catalog} initialTab="scooters" />;
}
