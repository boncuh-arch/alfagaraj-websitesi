import { NextRequest, NextResponse } from 'next/server';
import { NormalizedServiceRecord, TrackPhoto } from '@/lib/types';

const ALFA_SERVIS_BASE = process.env.ALFA_SERVIS_URL || 'https://alfaservis.vercel.app';

function mapStatusToStage(rawStatus?: string): {
  stageIndex: number;
  statusLabel: string;
  needsQuoteApproval: boolean;
} {
  const st = (rawStatus || 'KAYIT_ACIK').toUpperCase();
  switch (st) {
    case 'KAYIT_ACIK':
      return { stageIndex: 0, statusLabel: 'Servis Kabul Edildi', needsQuoteApproval: false };
    case 'ARIZA_TESPITI':
      return { stageIndex: 1, statusLabel: 'Arıza Tespiti Yapılıyor', needsQuoteApproval: false };
    case 'ONAY_BEKLIYOR':
      return { stageIndex: 1, statusLabel: 'Müşteri Fiyat Onayı Bekleniyor', needsQuoteApproval: true };
    case 'PARCA_BEKLIYOR':
      return { stageIndex: 2, statusLabel: 'Yedek Parça Tedariği Bekleniyor', needsQuoteApproval: false };
    case 'TAMIRDE':
    case 'GERI_DONUS':
      return { stageIndex: 2, statusLabel: 'Onarım & Parça İşleminde', needsQuoteApproval: false };
    case 'TEST_ASAMASI':
      return { stageIndex: 3, statusLabel: 'Kalite & Yol Testinde', needsQuoteApproval: false };
    case 'TESLIME_HAZIR':
      return { stageIndex: 4, statusLabel: 'Teslime Hazır', needsQuoteApproval: false };
    case 'TESLIM_EDILDI':
      return { stageIndex: 4, statusLabel: 'Teslim Edildi', needsQuoteApproval: false };
    default:
      return { stageIndex: 1, statusLabel: st.replace(/_/g, ' '), needsQuoteApproval: false };
  }
}

function formatDateFromTs(ts: unknown): string | undefined {
  if (!ts || typeof ts !== 'object') return undefined;
  const obj = ts as { seconds?: number; _seconds?: number };
  const sec = obj.seconds || obj._seconds;
  if (!sec) return undefined;
  try {
    return new Date(sec * 1000).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRecord(item: any): NormalizedServiceRecord {
  const { stageIndex, statusLabel, needsQuoteApproval } = mapStatusToStage(item.servisDurumu);

  const photos: TrackPhoto[] = [];
  if (Array.isArray(item.tamirOncesiResimler)) {
    item.tamirOncesiResimler.forEach((url: string, idx: number) => {
      if (url) photos.push({ label: `Servis Kabul ${idx + 1}`, url });
    });
  }
  if (Array.isArray(item.tamirResimleri)) {
    item.tamirResimleri.forEach((url: string, idx: number) => {
      if (url) photos.push({ label: `Onarım Aşaması ${idx + 1}`, url });
    });
  }
  if (Array.isArray(item.tamirSonrasiResimler)) {
    item.tamirSonrasiResimler.forEach((url: string, idx: number) => {
      if (url) photos.push({ label: `Teslim / Sonrası ${idx + 1}`, url });
    });
  }

  const brand = (item.scooterMarka || '').trim();
  const model = (item.scooterModel || '').trim();
  const deviceTitle = [brand, model].filter(Boolean).join(' ') || 'Elektrikli Scooter';
  const fullName = [item.musteriAdi, item.musteriSoyadi].filter(Boolean).join(' ').trim() || 'Müşteri';

  return {
    id: String(item.id || ''),
    code: String(item.isEmriNo || item.id || ''),
    customerName: fullName,
    maskedPhone: String(item.telefonNumarasi || ''),
    brand: brand || 'Scooter',
    model,
    deviceTitle,
    issue: String(item.arizaBilgisi || 'Genel Kontrol & Bakım'),
    techNote:
      String(item.yapilanIslemler || '').trim() ||
      'Cihazınız Alfa Garaj teknik ekibi tarafından işlem sırasına göre takip edilmektedir.',
    rawStatus: String(item.servisDurumu || 'KAYIT_ACIK'),
    statusLabel,
    stageIndex,
    needsQuoteApproval,
    showPrice: item.fiyatGosterilsinMi !== false,
    totalPrice: typeof item.toplamUcret === 'number' ? item.toplamUcret : undefined,
    createdAtText: formatDateFromTs(item.olusturulmaTarihi),
    photos,
    parts: Array.isArray(item.parcalar) ? item.parcalar : [],
    approvalUrl: `${ALFA_SERVIS_BASE}/track?id=${encodeURIComponent(String(item.id || ''))}`,
  };
}

async function callUpstreamTrack(payload: { id?: string; phone?: string }) {
  const res = await fetch(`${ALFA_SERVIS_BASE}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawQuery = String(body?.query || '').trim();

    if (!rawQuery || rawQuery.length < 3) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir cep telefonu numarası veya servis fiş numarası girin.' },
        { status: 400 }
      );
    }

    const digitsOnly = rawQuery.replace(/\D/g, '');
    const hasLetters = /[a-zA-Z]/.test(rawQuery);
    const looksLikePhone = !hasLetters && digitsOnly.length >= 10 && digitsOnly.length <= 13;

    let rawResults = [];
    if (looksLikePhone) {
      rawResults = await callUpstreamTrack({ phone: rawQuery });
      if (rawResults.length === 0) {
        rawResults = await callUpstreamTrack({ id: rawQuery });
      }
    } else {
      rawResults = await callUpstreamTrack({ id: rawQuery });
      if (rawResults.length === 0 && digitsOnly.length >= 10) {
        rawResults = await callUpstreamTrack({ phone: digitsOnly });
      }
    }

    const records: NormalizedServiceRecord[] = rawResults.map(normalizeRecord);
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json(
      { error: 'Servis takip sistemine bağlanırken geçici bir sorun oluştu. Lütfen tekrar deneyin.' },
      { status: 502 }
    );
  }
}
