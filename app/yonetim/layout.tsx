import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Yönetim Paneli | Alfa Garaj',
  robots: {
    index: false,
    follow: false,
  },
};

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
