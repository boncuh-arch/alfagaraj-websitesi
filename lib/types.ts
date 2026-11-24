export type ThemeKey = 'c1' | 'c2' | 'c3' | 'c4';

export type ScooterCondition = 'Sıfır' | '2. El';
export type BrandName = 'Segway' | 'ONVO' | 'Diğer';

export interface ScooterItem {
  id: string;
  cond: ScooterCondition;
  brand: BrandName;
  name: string;
  desc: string;
  badge: string;
  battery: number;
  price: string;
  stockStatus: 'Stokta Mevcut' | 'Sipariş Üzerine' | 'Tükendi';
  img: string;
  images?: string[];
}

export function getScooterImages(s: ScooterItem): string[] {
  const arr = Array.isArray(s.images) ? s.images.filter((u) => typeof u === 'string' && u.trim().length > 0) : [];
  if (arr.length > 0) return arr;
  if (s.img && s.img.trim().length > 0) return [s.img];
  return ['/products/segway-scooter.svg'];
}

export interface SparePartItem {
  id: string;
  brand: BrandName;
  name: string;
  code: string;
  compat: string;
  stock: number;
  price: string;
  img: string;
}

export interface SiteSettings {
  theme: ThemeKey;
  phoneDisplay: string;
  phoneRaw: string;
  secondaryPhoneDisplay?: string;
  whatsappNumber: string;
  address: string;
  districtCity: string;
  workingHours: string;
}

export interface CatalogData {
  updatedAt: string;
  settings: SiteSettings;
  scooters: ScooterItem[];
  parts: SparePartItem[];
}

export interface TrackPhoto {
  label: string;
  url: string;
}

export interface TrackPartLine {
  parcaAdi: string;
  satisFiyati: number;
  adet: number;
  isLabor?: boolean;
}

export interface NormalizedServiceRecord {
  id: string;
  code: string;
  customerName: string;
  maskedPhone: string;
  brand: string;
  model: string;
  deviceTitle: string;
  issue: string;
  techNote: string;
  rawStatus: string;
  statusLabel: string;
  stageIndex: number; // 0..4
  needsQuoteApproval: boolean;
  showPrice: boolean;
  totalPrice?: number;
  createdAtText?: string;
  photos: TrackPhoto[];
  parts: TrackPartLine[];
  approvalUrl: string;
}
