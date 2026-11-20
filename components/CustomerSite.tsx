'use client';

import React, { useMemo, useState } from 'react';
import {
  CatalogData,
  NormalizedServiceRecord,
  ThemeKey,
} from '@/lib/types';

type PageTab = 'home' | 'scooters' | 'parts';

interface CartItem {
  id: string;
  name: string;
  priceText: string;
  unitPrice: number;
  qty: number;
  img: string;
  category: string;
}

function parsePriceNumber(priceStr: string): number {
  const cleaned = (priceStr || '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' ₺';
}

const STAGES = [
  'Servis Kabul',
  'Arıza Tespiti',
  'Onarım & Parça',
  'Test & Kontrol',
  'Teslime Hazır',
];

const THEMES: Record<
  ThemeKey,
  {
    pageBg: string;
    headerBg: string;
    topStripBg: string;
    logoDarkBg: boolean;
    heroBg: string;
    heroIsDark?: boolean;
    surfaceBg: string;
    subtleBg: string;
    pillWrapBg: string;
    pillActive: string;
    pillIdle: string;
    title: string;
    body: string;
    muted: string;
    primaryBtn: string;
    secondaryBtn: string;
    barFill: string;
    barTrack: string;
    badgePrimary: string;
    badgeUsed: string;
    inputCls: string;
    divider: string;
  }
> = {
  c1: {
    pageBg: 'bg-[#F8FAFC]',
    headerBg: 'bg-white border-slate-200/80',
    topStripBg: 'bg-slate-900 text-slate-300',
    logoDarkBg: false,
    heroBg: 'bg-white border border-slate-200/80 elevated',
    surfaceBg: 'bg-white border-slate-200/80',
    subtleBg: 'bg-slate-50 border-slate-200/80',
    pillWrapBg: 'bg-slate-100 border-slate-200/80',
    pillActive: 'bg-white text-slate-900 shadow-xs',
    pillIdle: 'text-slate-600 hover:text-slate-900',
    title: 'text-slate-900',
    body: 'text-slate-600',
    muted: 'text-slate-500',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
    secondaryBtn: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200',
    barFill: 'bg-slate-900',
    barTrack: 'bg-slate-200',
    badgePrimary: 'bg-slate-900 text-white',
    badgeUsed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    inputCls: 'bg-white border-slate-300 text-slate-900 focus:border-slate-900',
    divider: 'border-slate-200/70',
  },
  c2: {
    pageBg: 'bg-[#F0F5FA]',
    headerBg: 'bg-white border-slate-200',
    topStripBg: 'bg-[#0B2545] text-blue-100',
    logoDarkBg: false,
    heroBg: 'bg-gradient-to-br from-[#0B2545] to-[#133B6E] text-white elevated',
    heroIsDark: true,
    surfaceBg: 'bg-white border-slate-200',
    subtleBg: 'bg-[#F6F9FC] border-slate-200',
    pillWrapBg: 'bg-[#E3ECF6] border-blue-200/60',
    pillActive: 'bg-[#0B2545] text-white shadow-xs',
    pillIdle: 'text-slate-700 hover:text-[#0B2545]',
    title: 'text-slate-900',
    body: 'text-slate-600',
    muted: 'text-slate-500',
    primaryBtn: 'bg-[#005A9C] hover:bg-[#0B2545] text-white',
    secondaryBtn: 'bg-white hover:bg-blue-50 text-[#0B2545] border border-blue-200',
    barFill: 'bg-[#005A9C]',
    barTrack: 'bg-slate-200',
    badgePrimary: 'bg-[#005A9C] text-white',
    badgeUsed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    inputCls: 'bg-white border-slate-300 text-slate-900 focus:border-[#005A9C]',
    divider: 'border-slate-200',
  },
  c3: {
    pageBg: 'bg-[#F7F6F1]',
    headerBg: 'bg-[#FCFBF8] border-[#E5E2D9]',
    topStripBg: 'bg-[#1C382B] text-stone-200',
    logoDarkBg: false,
    heroBg: 'bg-white border border-[#E5E2D9] elevated',
    surfaceBg: 'bg-white border-[#E5E2D9]',
    subtleBg: 'bg-[#F7F6F1] border-[#E5E2D9]',
    pillWrapBg: 'bg-[#ECEAE2] border-[#DFDCD2]',
    pillActive: 'bg-[#1C382B] text-white shadow-xs',
    pillIdle: 'text-stone-600 hover:text-stone-900',
    title: 'text-stone-900',
    body: 'text-stone-600',
    muted: 'text-stone-500',
    primaryBtn: 'bg-[#1C382B] hover:bg-[#254B3A] text-white',
    secondaryBtn: 'bg-white hover:bg-stone-50 text-stone-800 border border-[#DFDCD2]',
    barFill: 'bg-[#1C382B]',
    barTrack: 'bg-stone-200',
    badgePrimary: 'bg-[#1C382B] text-white',
    badgeUsed: 'bg-amber-50 text-amber-900 border border-amber-200',
    inputCls: 'bg-white border-stone-300 text-stone-900 focus:border-[#1C382B]',
    divider: 'border-[#E5E2D9]',
  },
  c4: {
    pageBg: 'bg-[#141A23]',
    headerBg: 'bg-[#1A222E] border-slate-800',
    topStripBg: 'bg-[#0F141C] text-slate-400',
    logoDarkBg: true,
    heroBg: 'bg-[#1E2736] border border-slate-700/70 text-white elevated',
    heroIsDark: true,
    surfaceBg: 'bg-[#1E2736] border-slate-700/70',
    subtleBg: 'bg-[#161D28] border-slate-800',
    pillWrapBg: 'bg-[#141A23] border-slate-700',
    pillActive: 'bg-sky-500 text-slate-950 shadow-xs',
    pillIdle: 'text-slate-300 hover:text-white',
    title: 'text-slate-100',
    body: 'text-slate-300',
    muted: 'text-slate-400',
    primaryBtn: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    secondaryBtn: 'bg-[#253042] hover:bg-[#2D3A4F] text-slate-100 border border-slate-700',
    barFill: 'bg-sky-400',
    barTrack: 'bg-slate-800',
    badgePrimary: 'bg-sky-500 text-slate-950',
    badgeUsed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    inputCls: 'bg-[#141A23] border-slate-700 text-white focus:border-sky-400',
    divider: 'border-slate-800',
  },
};

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current shrink-0`} aria-hidden="true">
      <path d="M12.03 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.49 1.34 5.01L2 22l5.13-1.34A9.96 9.96 0 0 0 12.03 22c5.52 0 10-4.48 10-10S17.55 2 12.03 2zm5.82 14.13c-.24.68-1.4 1.3-1.95 1.38-.5.08-1.14.11-1.84-.11-.43-.14-.98-.32-1.68-.62-2.96-1.28-4.89-4.26-5.04-4.46-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.03.9 2.18.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.4z" />
    </svg>
  );
}

export default function CustomerSite({
  initialCatalog,
  initialTab = 'home',
}: {
  initialCatalog: CatalogData;
  initialTab?: PageTab;
}) {
  const [page, setPage] = useState<PageTab>(initialTab);
  const [scooterCond, setScooterCond] = useState<'Tümü' | 'Sıfır' | '2. El'>('Tümü');
  const [scooterBrand, setScooterBrand] = useState<'Tümü' | 'Segway' | 'ONVO'>('Tümü');
  const [partBrand, setPartBrand] = useState<'Tümü' | 'Segway' | 'ONVO'>('Tümü');
  const [partSearch, setPartSearch] = useState('');

  // Canlı Servis Takip State
  const [queryText, setQueryText] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackRecords, setTrackRecords] = useState<NormalizedServiceRecord[]>([]);

  // Sepet & Modallar
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const settings = initialCatalog.settings;
  const themeKey: ThemeKey = THEMES[settings.theme] ? settings.theme : 'c1';
  const t = THEMES[themeKey];
  const waNum = settings.whatsappNumber || '905321352815';

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  }

  function buildWaUrl(text: string) {
    return `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`;
  }

  function switchPage(nextPage: PageTab) {
    setPage(nextPage);
    if (typeof window !== 'undefined') {
      const targetPath =
        nextPage === 'scooters' ? '/scooterlar' : nextPage === 'parts' ? '/yedek-parca' : '/';
      window.history.replaceState(null, '', targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleServiceQuery(e: React.FormEvent) {
    e.preventDefault();
    const q = queryText.trim();
    if (!q) {
      setTrackError('Lütfen kayıtlı cep telefonu numaranızı veya servis fiş numaranızı girin.');
      return;
    }
    setTrackLoading(true);
    setTrackError(null);
    setTrackSearched(true);
    try {
      const res = await fetch('/api/servis-sorgula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTrackError(data?.error || 'Sorgulama sırasında bir hata oluştu.');
        setTrackRecords([]);
      } else {
        setTrackRecords(Array.isArray(data?.records) ? data.records : []);
      }
    } catch {
      setTrackError('Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.');
      setTrackRecords([]);
    } finally {
      setTrackLoading(false);
    }
  }

  function addToCart(item: {
    id: string;
    name: string;
    price: string;
    img: string;
    category: string;
  }) {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          priceText: item.price,
          unitPrice: parsePriceNumber(item.price),
          qty: 1,
          img: item.img,
          category: item.category,
        },
      ];
    });
    showToast(`Sepete eklendi: ${item.name}`);
  }

  function updateCartQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0)
    );
  }

  const cartCount = useMemo(() => cart.reduce((acc, x) => acc + x.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, x) => acc + x.unitPrice * x.qty, 0), [cart]);

  function checkoutViaWhatsApp() {
    if (cart.length === 0) return;
    const lines = cart.map((c, idx) => `${idx + 1}. ${c.name} (${c.qty} Adet) — ${c.priceText}`);
    const msg = `Merhaba Alfa Garaj, web sitenizden aşağıdaki ürünleri sipariş vermek / stok teyidi almak istiyorum:\n\n${lines.join(
      '\n'
    )}\n\nToplam: ${formatTL(cartTotal)}`;
    window.open(buildWaUrl(msg), '_blank', 'noopener,noreferrer');
  }

  const filteredScooters = useMemo(
    () =>
      initialCatalog.scooters.filter(
        (s) =>
          (scooterCond === 'Tümü' || s.cond === scooterCond) &&
          (scooterBrand === 'Tümü' || s.brand === scooterBrand)
      ),
    [initialCatalog.scooters, scooterCond, scooterBrand]
  );

  const filteredParts = useMemo(() => {
    const q = partSearch.trim().toLowerCase();
    return initialCatalog.parts.filter((p) => {
      const matchBrand = partBrand === 'Tümü' || p.brand === partBrand;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.compat.toLowerCase().includes(q);
      return matchBrand && matchSearch;
    });
  }, [initialCatalog.parts, partBrand, partSearch]);

  const BrandBadges = (
    <div className="inline-flex items-center gap-5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <img src="/logos/segway.png" alt="Segway Yetkili & Özel Servis" className="h-9 w-auto object-contain" />
      <span className="h-7 w-px bg-slate-200" />
      <img src="/logos/onvo.png" alt="ONVO Scooter Servis" className="h-8 w-auto object-contain" />
    </div>
  );

  return (
    <div className={`${t.pageBg} min-h-screen flex flex-col justify-between`}>
      <div>
        {/* Üst Kurumsal Bilgi Bandı */}
        <div className={`${t.topStripBg} px-4 sm:px-8 py-2 text-xs`}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span>
              Alfa Garaj — Gebze Segway & ONVO Elektrikli Scooter Servis, Yedek Parça ve Satış Merkezi
            </span>
            <div className="flex items-center gap-4 tabular">
              <span className="hidden sm:inline">{settings.workingHours}</span>
              <a href={`tel:${settings.phoneRaw}`} className="font-semibold hover:underline">
                {settings.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        {/* Ana Navigasyon Barı (Müşteri görünümünde Admin linki yoktur) */}
        <header className={`border-b ${t.headerBg} px-4 sm:px-8 py-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-95`}>
          <div className="max-w-6xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => switchPage('home')}
              className="shrink-0 text-left focus:outline-none cursor-pointer"
              aria-label="Alfa Garaj Ana Sayfa"
            >
              <img
                src="/logos/alfa-garaj.png"
                alt="Alfa Garaj — E-Bike, E-Scooter, E-Motorcycle"
                className={`h-10 sm:h-11 w-auto object-contain ${t.logoDarkBg ? 'logo-white' : ''}`}
              />
            </button>

            {/* Ayrı Sayfa Sekmeleri */}
            <nav
              aria-label="Ana Menü"
              className={`flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl border ${t.pillWrapBg} order-3 md:order-2 w-full md:w-auto justify-center overflow-x-auto no-scrollbar`}
            >
              <button
                type="button"
                onClick={() => switchPage('home')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  page === 'home' ? t.pillActive : t.pillIdle
                }`}
              >
                Servis Sorgula
              </button>
              <button
                type="button"
                onClick={() => switchPage('scooters')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  page === 'scooters' ? t.pillActive : t.pillIdle
                }`}
              >
                Sıfır & 2. El Scooter
              </button>
              <button
                type="button"
                onClick={() => switchPage('parts')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  page === 'parts' ? t.pillActive : t.pillIdle
                }`}
              >
                Yedek Parça
              </button>
            </nav>

            {/* Sağ Aksiyonlar: WhatsApp & Sepet */}
            <div className="flex items-center gap-2.5 shrink-0 order-2 md:order-3">
              <button
                type="button"
                onClick={() => setWaModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer transition-colors"
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap tabular cursor-pointer ${t.secondaryBtn}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h12l1 12.5H5L6 7.5Z" />
                  <path strokeLinecap="round" d="M9 7.5V6a3 3 0 0 1 6 0v1.5" />
                </svg>
                <span>Sepet ({cartCount})</span>
              </button>
            </div>
          </div>
        </header>

        {/* =============================================================== */}
        {/* BÖLÜM 1: ANA SAYFA & CANLI SERVİS DURUMU SORGULAMA              */}
        {/* =============================================================== */}
        {page === 'home' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-10">
            {/* Karşılama Hero */}
            <section className={`rounded-3xl p-7 sm:p-10 ${t.heroBg}`}>
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-5">
                  {BrandBadges}
                  <h1
                    className={`text-2xl sm:text-4xl font-bold tracking-tight leading-[1.2] ${
                      t.heroIsDark ? 'text-white' : t.title
                    }`}
                  >
                    Segway ve ONVO Uzman Teknik Servis, Yedek Parça ve Satış Merkezi
                  </h1>
                  <p
                    className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
                      t.heroIsDark ? 'text-slate-200' : t.body
                    }`}
                  >
                    Gebze Alfa Garaj güvencesiyle servisteki elektrikli scooter&apos;ınızın güncel onarım aşamasını ve servis fotoğraflarını aşağıdan anlık sorgulayabilir; orijinal yedek parça, sıfır ve ekspertiz garantili ikinci el araçlarımızı inceleyebilirsiniz.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => switchPage('scooters')}
                      className={`px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors ${
                        t.heroIsDark ? 'bg-white text-slate-900 hover:bg-slate-100' : t.primaryBtn
                      }`}
                    >
                      Sıfır & 2. El Scooterları İncele →
                    </button>
                    <button
                      type="button"
                      onClick={() => switchPage('parts')}
                      className={`px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors ${
                        t.heroIsDark
                          ? 'bg-white/15 text-white border border-white/25 hover:bg-white/20'
                          : t.secondaryBtn
                      }`}
                    >
                      Yedek Parça Mağazası →
                    </button>
                  </div>
                </div>

                {/* Hızlı WhatsApp Destek Kartı */}
                <div
                  className={`lg:col-span-4 p-6 rounded-2xl ${
                    t.heroIsDark ? 'bg-white/10 border border-white/15 text-white' : `${t.subtleBg} border`
                  } space-y-4`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
                    Gebze Teknik Servis & Satış Hattı
                  </div>
                  <div className="text-base font-bold">Arıza, Parça veya 2. El Değerleme</div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Cihazınızın fotoğrafını veya yedek parça talebinizi WhatsApp hattımızdan ileterek ustalarımızdan doğrudan bilgi alabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setWaModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp Destek Hattı</span>
                  </button>
                </div>
              </div>
            </section>

            {/* CANLI SERVİS TAKİP SORGULAMA (Alfa Servis Canlı Veritabanı Köprüsü) */}
            <section id="servis-sorgula" className={`rounded-3xl border p-6 sm:p-8 ${t.surfaceBg} elevated`}>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>
                  Alfa Servis Takip Sistemi
                </span>
                <h2 className={`text-xl sm:text-2xl font-bold ${t.title} mt-0.5`}>
                  Canlı Servis Durumu Sorgulama
                </h2>
                <p className={`text-sm ${t.muted} mt-1`}>
                  Servise bıraktığınız cihazın kayıtlı cep telefonu numarasını veya servis fiş kodunu girerek güncel aşamayı ve servis fotoğraflarını görüntüleyin.
                </p>
              </div>

              <form onSubmit={handleServiceQuery} className="mt-5 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Cep Telefonu Numaranız (05XX...) veya Servis Fiş Numarası"
                  className={`flex-1 px-4 py-3.5 rounded-xl border text-sm tabular focus:outline-none ${t.inputCls}`}
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className={`px-7 py-3.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-60 ${t.primaryBtn}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                  </svg>
                  <span>{trackLoading ? 'Sorgulanıyor...' : 'Cihazımı Sorgula'}</span>
                </button>
              </form>

              {trackError && (
                <div className={`mt-5 p-4 rounded-xl border ${t.subtleBg} text-sm text-rose-600 font-medium`}>
                  {trackError}
                </div>
              )}

              {trackSearched && !trackLoading && !trackError && trackRecords.length === 0 && (
                <div className={`mt-5 p-5 rounded-2xl border ${t.subtleBg} text-sm ${t.body}`}>
                  Girilen telefon numarası veya servis koduna ait aktif bir servis kaydı bulunamadı. Lütfen kayıt esnasında verdiğiniz telefon numarasını kontrol edin veya{' '}
                  <a
                    href={buildWaUrl('Merhaba Alfa Garaj, servisteki cihazımın durumu hakkında bilgi almak istiyorum.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline font-semibold ${t.title}`}
                  >
                    WhatsApp hattımızdan
                  </a>{' '}
                  destek alın.
                </div>
              )}

              {trackRecords.length > 0 && (
                <div className="mt-6 space-y-6">
                  {trackRecords.map((rec) => {
                    const pct = Math.round(((rec.stageIndex + 1) / STAGES.length) * 100);
                    return (
                      <div key={rec.id} className={`p-6 rounded-2xl border ${t.subtleBg} space-y-5`}>
                        {/* Kayıt Üst Bilgisi */}
                        <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${t.divider}`}>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold tabular ${t.badgePrimary}`}>
                              #{rec.code}
                            </span>
                            <div>
                              <div className={`font-bold text-base ${t.title}`}>{rec.deviceTitle}</div>
                              <div className={`text-xs ${t.muted}`}>
                                {rec.customerName}
                                {rec.maskedPhone ? ` • ${rec.maskedPhone}` : ''}
                                {rec.createdAtText ? ` • Kayıt: ${rec.createdAtText}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                rec.stageIndex === 4
                                  ? 'bg-emerald-500/15 text-emerald-700'
                                  : rec.needsQuoteApproval
                                  ? 'bg-rose-500/15 text-rose-700'
                                  : 'bg-amber-500/15 text-amber-800'
                              }`}
                            >
                              {rec.statusLabel}
                            </span>
                            {rec.needsQuoteApproval && (
                              <a
                                href={rec.approvalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Fiyat Teklifini Onayla →
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 5 Adımlı İlerleme Çubuğu */}
                        <div>
                          <div className={`h-2 w-full rounded-full ${t.barTrack} overflow-hidden`}>
                            <div
                              className={`h-full rounded-full ${t.barFill} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                            {STAGES.map((st, idx) => (
                              <div
                                key={st}
                                className={`text-xs ${
                                  idx <= rec.stageIndex ? `${t.title} font-semibold` : t.muted
                                }`}
                              >
                                <span className="tabular">{idx + 1}.</span> {st}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cihaz Fotoğrafları ve Servis Detayı */}
                        <div className="grid md:grid-cols-12 gap-5 pt-1 items-start">
                          {rec.photos.length > 0 && (
                            <div className="md:col-span-5">
                              <div className={`text-xs font-semibold ${t.muted} mb-2`}>
                                Servis Cihaz Görselleri (Büyütmek için tıklayın)
                              </div>
                              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                                {rec.photos.map((ph, i) => (
                                  <button
                                    key={`${ph.url}-${i}`}
                                    type="button"
                                    onClick={() =>
                                      setLightbox({
                                        src: ph.url,
                                        title: `${rec.deviceTitle} — ${ph.label}`,
                                      })
                                    }
                                    className="group relative w-28 h-20 rounded-xl overflow-hidden border border-slate-300/70 bg-white shrink-0 cursor-pointer"
                                  >
                                    <img
                                      src={ph.url}
                                      alt={ph.label}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white text-[10px] px-1.5 py-0.5 truncate">
                                      {ph.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div
                            className={`${
                              rec.photos.length > 0 ? 'md:col-span-7' : 'md:col-span-12'
                            } p-4 rounded-xl border ${t.surfaceBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                          >
                            <div className="space-y-1.5 text-sm">
                              <div>
                                <span className={`text-xs font-semibold ${t.muted}`}>Arıza / Talep: </span>
                                <span className={`${t.title} font-medium`}>{rec.issue}</span>
                              </div>
                              <div>
                                <span className={`text-xs font-semibold ${t.muted}`}>Servis Notu: </span>
                                <span className={t.body}>{rec.techNote}</span>
                              </div>
                            </div>

                            {rec.showPrice && typeof rec.totalPrice === 'number' && rec.totalPrice > 0 && (
                              <div className={`shrink-0 sm:text-right border-t sm:border-t-0 sm:border-l ${t.divider} pt-3 sm:pt-0 sm:pl-4`}>
                                <span className={`block text-xs ${t.muted}`}>Toplam Tutar</span>
                                <span className={`text-lg font-bold tabular ${t.title}`}>
                                  {formatTL(rec.totalPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Ayrı Mağaza Sayfalarına Hızlı Geçiş Kartları */}
            <section className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => switchPage('scooters')}
                className={`cursor-pointer rounded-2xl border p-6 ${t.surfaceBg} card-lift flex items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>
                    Araç Satış & Ekspertiz
                  </span>
                  <h3 className={`text-lg font-bold ${t.title}`}>Sıfır & Garantili 2. El Scooterlar</h3>
                  <p className={`text-sm ${t.body}`}>
                    Kapalı kutu sıfır Segway / ONVO modelleri ve Alfa Garaj garantili ikinci el araçlar.
                  </p>
                  <span className={`inline-block pt-1 text-sm font-semibold ${t.title}`}>
                    Araç Vitrinine Git →
                  </span>
                </div>
                {initialCatalog.scooters[0] && (
                  <img
                    src={initialCatalog.scooters[0].img}
                    alt={initialCatalog.scooters[0].name}
                    className="w-28 h-20 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                  />
                )}
              </div>

              <div
                onClick={() => switchPage('parts')}
                className={`cursor-pointer rounded-2xl border p-6 ${t.surfaceBg} card-lift flex items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>
                    Orijinal Bileşen Stoğu
                  </span>
                  <h3 className={`text-lg font-bold ${t.title}`}>Segway & ONVO Yedek Parça Mağazası</h3>
                  <p className={`text-sm ${t.body}`}>
                    Tubeless lastik, sürücü anakart, BMS batarya ve hidrolik fren grupları.
                  </p>
                  <span className={`inline-block pt-1 text-sm font-semibold ${t.title}`}>
                    Yedek Parçalara Git →
                  </span>
                </div>
                {initialCatalog.parts[0] && (
                  <img
                    src={initialCatalog.parts[0].img}
                    alt={initialCatalog.parts[0].name}
                    className="w-28 h-20 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                  />
                )}
              </div>
            </section>

            {/* Uzmanlık Alanlarımız & Gebze Yerel SEO Bilgilendirme Bölümü */}
            <section className="grid md:grid-cols-3 gap-6">
              <div className={`rounded-2xl border p-6 ${t.surfaceBg} space-y-2`}>
                <h3 className={`font-bold text-base ${t.title}`}>Batarya & BMS Laboratuvarı</h3>
                <p className={`text-sm ${t.body} leading-relaxed`}>
                  Lityum hücre değişimi, nokta kaynak (puntalama), kapasite ölçümü, BMS kart onarımı ve güvenli sıvı teması izolasyonu.
                </p>
              </div>
              <div className={`rounded-2xl border p-6 ${t.surfaceBg} space-y-2`}>
                <h3 className={`font-bold text-base ${t.title}`}>Motor & Sürücü Anakart Onarımı</h3>
                <p className={`text-sm ${t.body} leading-relaxed`}>
                  Segway ve ONVO hub motor rulman/kablo onarımı, hall sensör değişimi, orijinal sürücü (controller) değişimi ve yazılım kalibrasyonu.
                </p>
              </div>
              <div className={`rounded-2xl border p-6 ${t.surfaceBg} space-y-2`}>
                <h3 className={`font-bold text-base ${t.title}`}>Lastik, Fren & Periyodik Bakım</h3>
                <p className={`text-sm ${t.body} leading-relaxed`}>
                  Jel destekli patlamaz tubeless lastik montajı, hidrolik/mekanik disk fren ayarı, gidon boşluğu giderme ve süspansiyon bakımı.
                </p>
              </div>
            </section>
          </main>
        )}

        {/* =============================================================== */}
        {/* BÖLÜM 2: SIFIR & 2. EL SCOOTER MAĞAZASI (Ayrı Görünüm)          */}
        {/* =============================================================== */}
        {page === 'scooters' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <div className="mb-3">{BrandBadges}</div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${t.title}`}>
                  Sıfır & Ekspertiz Garantili 2. El Scooterlar
                </h1>
                <p className={`text-sm ${t.muted} mt-1`}>
                  Sıfır kapalı kutu ve Alfa Garaj atölyesinde test edilmiş garantili ikinci el modelleri inceleyin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className={`inline-flex p-1 rounded-xl border ${t.pillWrapBg}`}>
                  {(
                    [
                      { v: 'Tümü', l: 'Tüm Araçlar' },
                      { v: 'Sıfır', l: 'Sıfır Scooter' },
                      { v: '2. El', l: '2. El Garantili' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setScooterCond(opt.v)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        scooterCond === opt.v ? t.pillActive : t.pillIdle
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>

                <div className={`inline-flex p-1 rounded-xl border ${t.pillWrapBg}`}>
                  {(['Tümü', 'Segway', 'ONVO'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setScooterBrand(b)}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        scooterBrand === b ? t.pillActive : t.pillIdle
                      }`}
                    >
                      {b === 'Tümü' ? 'Tüm Markalar' : b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredScooters.length === 0 ? (
              <div className={`p-8 rounded-2xl border ${t.surfaceBg} text-center text-sm ${t.muted}`}>
                Seçilen filtreye uygun araç bulunamadı.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScooters.map((s) => (
                  <article
                    key={s.id}
                    className={`rounded-2xl border ${t.surfaceBg} overflow-hidden flex flex-col justify-between card-lift`}
                  >
                    <div>
                      <div
                        onClick={() => setLightbox({ src: s.img, title: s.name })}
                        className="cursor-pointer relative h-52 bg-slate-100 border-b border-slate-200/60 overflow-hidden"
                      >
                        <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                        <span
                          className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold ${
                            s.cond === 'Sıfır' ? t.badgePrimary : t.badgeUsed
                          }`}
                        >
                          {s.cond === 'Sıfır' ? 'Sıfır Kutu' : '2. El Ekspertizli'}
                        </span>
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold tabular shadow-xs">
                          Pil: %{s.battery}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          {s.brand === 'Segway' || s.brand === 'ONVO' ? (
                            <img
                              src={s.brand === 'Segway' ? '/logos/segway.png' : '/logos/onvo.png'}
                              alt={s.brand}
                              className={`h-5 w-auto object-contain ${
                                themeKey === 'c4' && s.brand === 'Segway' ? 'logo-white' : ''
                              }`}
                            />
                          ) : (
                            <span className={`text-xs font-bold ${t.muted}`}>{s.brand}</span>
                          )}
                          <span className={`text-xs font-medium ${t.muted}`}>{s.stockStatus}</span>
                        </div>
                        <h2 className={`font-bold text-lg ${t.title} mt-2`}>{s.name}</h2>
                        <p className={`text-sm ${t.body} mt-1.5 leading-relaxed`}>{s.desc}</p>
                        <div className="text-xs text-emerald-600 font-medium mt-2">{s.badge}</div>
                      </div>
                    </div>

                    <div className={`px-5 py-4 border-t ${t.divider} flex items-center justify-between gap-3`}>
                      <span className={`font-bold text-xl tabular ${t.title}`}>{s.price}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={buildWaUrl(
                            `Merhaba Alfa Garaj, "${s.name}" (${s.cond} - ${s.price}) ilanınız hakkında bilgi almak istiyorum.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-[#25D366]/15 text-emerald-700 hover:bg-[#25D366] hover:text-white text-xs font-semibold transition-colors"
                        >
                          WhatsApp Sor
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: s.id,
                              name: s.name,
                              price: s.price,
                              img: s.img,
                              category: `${s.cond} Scooter`,
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${t.primaryBtn}`}
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 2. El Alım & Takas Değerlendirme Kutusu */}
            <div className={`rounded-2xl border p-6 ${t.subtleBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <h3 className={`font-bold text-base ${t.title}`}>
                  Mevcut Elektrikli Scooter&apos;ınızı Satmak veya Takasa Vermek mi İstiyorsunuz?
                </h3>
                <p className={`text-sm ${t.body} mt-0.5`}>
                  Aracınızın fotoğraflarını ve kilometre bilgisini WhatsApp&apos;tan gönderin, Alfa Garaj ekspertiz ekibimiz ön fiyat değerlendirmesini hemen paylaşsın.
                </p>
              </div>
              <a
                href={buildWaUrl(
                  'Merhaba Alfa Garaj, ikinci el elektrikli scooterımı satmak / takas değerlendirmesi yaptırmak istiyorum.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <WhatsAppIcon />
                <span>2. El Değerleme Gönder</span>
              </a>
            </div>
          </main>
        )}

        {/* =============================================================== */}
        {/* BÖLÜM 3: YEDEK PARÇA MAĞAZASI (Ayrı Görünüm)                    */}
        {/* =============================================================== */}
        {page === 'parts' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <div className="mb-3">{BrandBadges}</div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${t.title}`}>
                  Segway & ONVO Yedek Parça Mağazası
                </h1>
                <p className={`text-sm ${t.muted} mt-1`}>
                  Orijinal ve tam uyumlu yedek parçaları kargo ile sipariş verebilir veya Gebze servisimizde montaj yaptırabilirsiniz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  placeholder="Parça adı veya model ara..."
                  className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none ${t.inputCls}`}
                />
                <div className={`inline-flex p-1 rounded-xl border ${t.pillWrapBg} self-start`}>
                  {(
                    [
                      { v: 'Tümü', l: 'Tüm Parçalar' },
                      { v: 'Segway', l: 'Segway Parçaları' },
                      { v: 'ONVO', l: 'ONVO Parçaları' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setPartBrand(opt.v)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        partBrand === opt.v ? t.pillActive : t.pillIdle
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredParts.length === 0 ? (
              <div className={`p-8 rounded-2xl border ${t.surfaceBg} text-center text-sm ${t.muted}`}>
                Aradığınız kriterde yedek parça bulunamadı. WhatsApp hattımızdan stok sorabilirsiniz.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredParts.map((p) => (
                  <article
                    key={p.id}
                    className={`rounded-2xl border ${t.surfaceBg} overflow-hidden flex flex-col justify-between card-lift`}
                  >
                    <div>
                      <div
                        onClick={() => setLightbox({ src: p.img, title: p.name })}
                        className="cursor-pointer h-44 bg-slate-100 border-b border-slate-200/60 overflow-hidden relative"
                      >
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 text-slate-700 font-mono text-[11px] font-semibold">
                          {p.code}
                        </span>
                      </div>
                      <div className="p-4">
                        {p.brand === 'Segway' || p.brand === 'ONVO' ? (
                          <img
                            src={p.brand === 'Segway' ? '/logos/segway.png' : '/logos/onvo.png'}
                            alt={p.brand}
                            className={`h-4 w-auto object-contain mb-2 ${
                              themeKey === 'c4' && p.brand === 'Segway' ? 'logo-white' : ''
                            }`}
                          />
                        ) : (
                          <span className={`text-xs font-bold block mb-1 ${t.muted}`}>{p.brand}</span>
                        )}
                        <h2 className={`font-semibold text-sm ${t.title} leading-snug`}>{p.name}</h2>
                        <p className={`text-xs ${t.muted} mt-1.5`}>Uyumlu: {p.compat}</p>
                        <div
                          className={`text-xs font-medium mt-1 tabular ${
                            p.stock > 0 ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {p.stock > 0 ? `Stokta (${p.stock} adet)` : 'Stok Sorunuz'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-3.5 border-t ${t.divider} flex items-center justify-between`}>
                      <span className={`font-bold text-base tabular ${t.title}`}>{p.price}</span>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            img: p.img,
                            category: 'Yedek Parça',
                          })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${t.primaryBtn}`}
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        )}
      </div>

      {/* Kurumsal Gebze İletişim & Adres Footer'ı */}
      <footer id="iletisim" className={`border-t ${t.headerBg} px-4 sm:px-8 py-10 mt-12`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <img
              src="/logos/alfa-garaj.png"
              alt="Alfa Garaj"
              className={`h-9 w-auto object-contain ${t.logoDarkBg ? 'logo-white' : ''}`}
            />
            <p className={`text-sm ${t.body} leading-relaxed`}>
              Gebze, Darıca, Çayırova, Dilovası ve Tuzla bölgesinde Segway ve ONVO elektrikli scooter tamiri, batarya/BMS yenileme, yedek parça ve garantili satış merkezi.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <img
                src="/logos/segway.png"
                alt="Segway"
                className={`h-6 w-auto object-contain ${t.logoDarkBg ? 'logo-white' : ''}`}
              />
              <img src="/logos/onvo.png" alt="ONVO Scooter" className="h-5 w-auto object-contain" />
            </div>
          </div>

          <div className="md:col-span-4 space-y-2 text-sm">
            <div className={`font-bold ${t.title}`}>Adres & Çalışma Saatleri</div>
            <p className={t.body}>{settings.address}</p>
            <p className={`font-medium ${t.title}`}>{settings.districtCity}</p>
            <p className={`text-xs ${t.muted} pt-1`}>{settings.workingHours}</p>
            <a
              href="https://maps.google.com/?q=40.8021,29.4307"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block text-xs font-semibold underline pt-1 ${t.title}`}
            >
              Google Haritalar&apos;da Yol Tarifi Al →
            </a>
          </div>

          <div className="md:col-span-3 space-y-2 text-sm">
            <div className={`font-bold ${t.title}`}>İletişim & WhatsApp</div>
            <a
              href={`tel:${settings.phoneRaw}`}
              className={`block text-xl font-bold tabular hover:underline ${t.title}`}
            >
              {settings.phoneDisplay}
            </a>
            {settings.secondaryPhoneDisplay && (
              <a
                href={`tel:+90${settings.secondaryPhoneDisplay.replace(/\D/g, '').replace(/^0/, '')}`}
                className={`block text-sm font-medium tabular hover:underline ${t.muted}`}
              >
                {settings.secondaryPhoneDisplay}
              </a>
            )}
            <button
              type="button"
              onClick={() => setWaModalOpen(true)}
              className="mt-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon />
              <span>WhatsApp&apos;tan Yazın</span>
            </button>
          </div>
        </div>
      </footer>

      {/* SEPET ÇEKMECESİ */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg">Sipariş Sepetiniz ({cartCount})</h3>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 cursor-pointer"
                >
                  Kapat ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-slate-500 py-12 text-center">
                  Sepetinizde henüz ürün veya yedek parça bulunmuyor.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[65vh] overflow-y-auto mt-2">
                  {cart.map((c) => (
                    <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={c.img}
                          alt={c.name}
                          className="w-14 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">{c.category}</div>
                          <div className="text-sm font-semibold text-slate-900 truncate">{c.name}</div>
                          <div className="text-xs font-bold text-slate-700 tabular">{c.priceText}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(c.id, -1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 text-sm font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular">{c.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(c.id, 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 text-sm font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Tahmini Toplam</span>
                  <span className="tabular">{formatTL(cartTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={checkoutViaWhatsApp}
                  className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon />
                  <span>WhatsApp ile Siparişi Tamamla</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP KONU SEÇİM PENCERESİ */}
      {waModalOpen && (
        <div
          onClick={() => setWaModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Alfa Garaj WhatsApp Hattı</div>
                  <div className="text-xs text-emerald-600 font-medium">{settings.phoneDisplay}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Kapat ✕
              </button>
            </div>
            <div className="py-4 space-y-2.5">
              <p className="text-xs text-slate-500 mb-2">
                Konu seçerek doğrudan WhatsApp hattımıza bağlanabilirsiniz:
              </p>
              <a
                href={buildWaUrl('Merhaba Alfa Garaj, Segway / ONVO cihazım için teknik servis bilgisi almak istiyorum.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWaModalOpen(false)}
                className="block w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-sm font-medium text-slate-800 transition-colors"
              >
                Teknik Servis & Arıza Danışma
              </a>
              <a
                href={buildWaUrl('Merhaba Alfa Garaj, Segway / ONVO yedek parça uyumluluk ve fiyat bilgisi sormak istiyorum.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWaModalOpen(false)}
                className="block w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-sm font-medium text-slate-800 transition-colors"
              >
                Yedek Parça Sipariş & Uyumluluk
              </a>
              <a
                href={buildWaUrl('Merhaba Alfa Garaj, ikinci el scooter satışı / takas değerlendirmesi için bilgi almak istiyorum.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWaModalOpen(false)}
                className="block w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-sm font-medium text-slate-800 transition-colors"
              >
                Sıfır / 2. El Scooter Alım & Değerleme
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BÜYÜK GÖRSEL LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-900 truncate pr-3">{lightbox.title}</span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 shrink-0 cursor-pointer"
              >
                Kapat ✕
              </button>
            </div>
            <div className="p-6 bg-slate-50 flex items-center justify-center">
              <img
                src={lightbox.src}
                alt={lightbox.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* TOAST BİLDİRİMİ */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium bg-slate-900 text-white whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
