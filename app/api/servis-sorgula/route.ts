import { NextRequest, NextResponse } from 'next/server';
import { NormalizedServiceRecord, TrackPhoto } from '@/lib/types';

// alfayazılım.com (IDN Türkçe karakterli alan adının standart Punycode karşılığı)
const DEFAULT_ALFA_SERVIS_URL = 'https://xn--alfayazlm-1pbb.com';

function getAlfaServisBase(): string {
  const envUrl = (process.env.ALFA_SERVIS_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl) return DEFAULT_ALFA_SERVIS_URL;
  try {
    // Türkçe karakterle girilmişse (örn. https://alfayazılım.com) otomatik Punycode URL'ye çevirir
    return new URL(envUrl).origin;
  } catch {
    return DEFAULT_ALFA_SERVIS_URL;
  }
}

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
function normalizeRecord(item: any, baseUrl: string): NormalizedServiceRecord {
  const { stageIndex, statusLabel, needsQuoteApproval } = mapStatusToStage(item.servisDurumu);

  const seenUrls = new Set<string>();
  const photos: TrackPhoto[] = [];

  const pushPhoto = (url: unknown, label: string) => {
    if (typeof url !== 'string' || !url.trim() || seenUrls.has(url)) return;
    seenUrls.add(url);
    photos.push({ label, url });
  };

  if (Array.isArray(item.tamirOncesiResimler)) {
    item.tamirOncesiResimler.forEach((url: string, idx: number) =>
      pushPhoto(url, `Servis Kabul ${idx + 1}`)
    );
  }
  if (Array.isArray(item.tamirResimleri)) {
    item.tamirResimleri.forEach((url: string, idx: number) =>
      pushPhoto(url, `Onarım Aşaması ${idx + 1}`)
    );
  }
  if (Array.isArray(item.tamirSonrasiResimler)) {
    item.tamirSonrasiResimler.forEach((url: string, idx: number) =>
      pushPhoto(url, `Teslim / Sonrası ${idx + 1}`)
    );
  }
  if (Array.isArray(item.photos)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item.photos.forEach((ph: any, idx: number) => {
      const st = String(ph?.stage || '').toUpperCase();
      const lbl =
        st === 'KABUL'
          ? `Servis Kabul ${idx + 1}`
          : st === 'TAMIR'
          ? `Onarım ${idx + 1}`
          : `Cihaz Görseli ${idx + 1}`;
      pushPhoto(ph?.url, lbl);
    });
  }

  const brand = String(item.scooterMarka || '').trim();
  const model = String(item.scooterModel || '').trim();
  const deviceTitle = [brand, model].filter(Boolean).join(' ') || 'Elektrikli Scooter';
  const fullName =
    [item.musteriAdi, item.musteriSoyadi].filter(Boolean).join(' ').trim() || 'Müşteri';

  return {
    id: String(item.id || ''),
    code: String(item.isEmriNo || item.id || ''),
    customerName: fullName,
    maskedPhone: String(item.telefonNumarasi || item.telefon || ''),
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
    approvalUrl: `${baseUrl}/track?id=${encodeURIComponent(String(item.id || ''))}`,
  };
}

// 301/302/307/308 yönlendirmelerinde POST gövdesini koruyarak istek atan güvenli yardımcı
async function postTrackPreserveBody(
  baseUrl: string,
  payload: { id?: string; phone?: string }
) {
  let targetUrl = `${baseUrl}/api/track`;
  const bodyStr = JSON.stringify(payload);

  for (let hop = 0; hop < 3; hop++) {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      redirect: 'manual',
      cache: 'no-store',
    });

    if ([301, 302, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) break;
      targetUrl = new URL(loc, targetUrl).toString();
      continue;
    }

    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return Array.isArray(data?.results) ? data.results : [];
  }
  return [];
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

    const baseUrl = getAlfaServisBase();
    const digitsOnly = rawQuery.replace(/\D/g, '');
    const hasLetters = /[a-zA-Z]/.test(rawQuery);
    const looksLikePhone = !hasLetters && digitsOnly.length >= 10 && digitsOnly.length <= 13;

    let rawResults = [];
    if (looksLikePhone) {
      // Parantez ve boşluklardan arındırılmış net rakamla (örn. 05418007586) sorgula
      rawResults = await postTrackPreserveBody(baseUrl, { phone: digitsOnly });
      if (rawResults.length === 0) {
        rawResults = await postTrackPreserveBody(baseUrl, { id: rawQuery });
      }
    } else {
      rawResults = await postTrackPreserveBody(baseUrl, { id: rawQuery });
      if (rawResults.length === 0 && digitsOnly.length >= 10) {
        rawResults = await postTrackPreserveBody(baseUrl, { phone: digitsOnly });
      }
    }

    const records: NormalizedServiceRecord[] = rawResults.map((r: unknown) =>
      normalizeRecord(r, baseUrl)
    );
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json(
      { error: 'Servis takip sistemine bağlanırken geçici bir sorun oluştu. Lütfen tekrar deneyin.' },
      { status: 502 }
    );
  }
}
