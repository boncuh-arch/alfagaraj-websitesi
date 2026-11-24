'use client';

import React, { useEffect, useState } from 'react';
import {
  BrandName,
  CatalogData,
  getScooterImages,
  ScooterCondition,
  ScooterItem,
  SparePartItem,
  ThemeKey,
} from '@/lib/types';

type AdminTab = 'scooters' | 'parts' | 'settings';

function isPlaceholderSvg(url?: string): boolean {
  return Boolean(url && url.startsWith('/products/') && url.endsWith('.svg'));
}

async function compressImageClient(file: File, maxWidth = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        'image/webp',
        0.85
      );
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

async function uploadSingleFile(file: File, prefixId: string): Promise<string> {
  const compressed = await compressImageClient(file);
  const fd = new FormData();
  fd.append('file', compressed, `${prefixId}-${Date.now()}.webp`);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || 'Görsel yüklenemedi.');
  }
  return data.url as string;
}

export default function AdminYonetimPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [storageLabel, setStorageLabel] = useState('');
  const [persistentInCloud, setPersistentInCloud] = useState(true);
  const [tab, setTab] = useState<AdminTab>('scooters');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  }

  async function loadAdminCatalog() {
    const res = await fetch('/api/admin/catalog', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setCatalog(data.catalog);
      setStorageLabel(data.storage?.label || '');
      setPersistentInCloud(Boolean(data.storage?.persistentInCloud));
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
    setCheckingAuth(false);
  }

  useEffect(() => {
    loadAdminCatalog();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword('');
      await loadAdminCatalog();
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginError(data?.error || 'Şifre doğrulanamadı.');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
    setCatalog(null);
  }

  async function persistCatalog(nextCatalog: CatalogData, customMessage?: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextCatalog),
      });
      const data = await res.json();
      if (res.ok) {
        setCatalog(nextCatalog);
        if (data?.storage) {
          setStorageLabel(data.storage.label);
          setPersistentInCloud(Boolean(data.storage.persistentInCloud));
        }
        notify(customMessage || 'Değişiklikler başarıyla kaydedildi ve vitrinde güncellendi.');
      } else {
        notify(data?.error || 'Kaydetme hatası oluştu.');
      }
    } catch {
      notify('Sunucu bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  }

  // Scooter için belirli bir yuvaya (0, 1, 2...) veya toplu çoklu fotoğraf ekleme
  async function handleScooterImagesUpload(
    files: FileList | null,
    scooterId: string,
    replaceSlotIndex?: number
  ) {
    if (!files || files.length === 0 || !catalog) return;
    const target = catalog.scooters.find((s) => s.id === scooterId);
    if (!target) return;

    setUploadingId(scooterId);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadSingleFile(file, scooterId);
        uploadedUrls.push(url);
      }

      const existingRaw = getScooterImages(target);
      // Eğer mevcut tek görsel varsayılan çizim SVG ise gerçek fotoğraflarla başlat
      const currentReal =
        existingRaw.length === 1 && isPlaceholderSvg(existingRaw[0]) ? [] : [...existingRaw];

      let nextImages: string[];
      if (typeof replaceSlotIndex === 'number' && uploadedUrls.length === 1) {
        nextImages = [...currentReal];
        if (replaceSlotIndex < nextImages.length) {
          nextImages[replaceSlotIndex] = uploadedUrls[0];
        } else {
          nextImages.push(uploadedUrls[0]);
        }
      } else {
        nextImages = [...currentReal, ...uploadedUrls];
      }

      const cover = nextImages[0] || '/products/segway-scooter.svg';
      const nextCatalog: CatalogData = {
        ...catalog,
        scooters: catalog.scooters.map((s) =>
          s.id === scooterId ? { ...s, img: cover, images: nextImages } : s
        ),
      };

      await persistCatalog(
        nextCatalog,
        `${uploadedUrls.length} adet fotoğraf yüklendi ve kaydedildi.`
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Görsel yüklenirken hata oluştu.');
    } finally {
      setUploadingId(null);
    }
  }

  function removeScooterImage(scooterId: string, idx: number) {
    if (!catalog) return;
    const target = catalog.scooters.find((s) => s.id === scooterId);
    if (!target) return;
    const imgs = getScooterImages(target).filter((_, i) => i !== idx);
    const fallback = target.brand === 'ONVO' ? '/products/onvo-scooter.svg' : '/products/segway-scooter.svg';
    const nextImages = imgs.length > 0 ? imgs : [fallback];
    const nextCatalog: CatalogData = {
      ...catalog,
      scooters: catalog.scooters.map((s) =>
        s.id === scooterId ? { ...s, img: nextImages[0], images: imgs } : s
      ),
    };
    persistCatalog(nextCatalog, 'Fotoğraf kaldırıldı.');
  }

  function makeCoverImage(scooterId: string, idx: number) {
    if (!catalog || idx === 0) return;
    const target = catalog.scooters.find((s) => s.id === scooterId);
    if (!target) return;
    const imgs = [...getScooterImages(target)];
    const [picked] = imgs.splice(idx, 1);
    if (!picked) return;
    imgs.unshift(picked);
    const nextCatalog: CatalogData = {
      ...catalog,
      scooters: catalog.scooters.map((s) =>
        s.id === scooterId ? { ...s, img: imgs[0], images: imgs } : s
      ),
    };
    persistCatalog(nextCatalog, 'Kapak fotoğrafı güncellendi.');
  }

  // Yedek parça için tek fotoğraf yükleme
  async function handlePartImageUpload(file: File | undefined, partId: string) {
    if (!file || !catalog) return;
    setUploadingId(partId);
    try {
      const url = await uploadSingleFile(file, partId);
      const nextCatalog: CatalogData = {
        ...catalog,
        parts: catalog.parts.map((p) => (p.id === partId ? { ...p, img: url } : p)),
      };
      await persistCatalog(nextCatalog, 'Parça görseli yüklendi ve kaydedildi.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Görsel yüklenirken hata oluştu.');
    } finally {
      setUploadingId(null);
    }
  }

  function updateScooterField<K extends keyof ScooterItem>(
    id: string,
    key: K,
    value: ScooterItem[K]
  ) {
    if (!catalog) return;
    setCatalog({
      ...catalog,
      scooters: catalog.scooters.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    });
  }

  function addScooter() {
    if (!catalog) return;
    const newItem: ScooterItem = {
      id: `sc-${Date.now()}`,
      cond: '2. El',
      brand: 'Segway',
      name: 'Yeni Scooter Modeli',
      desc: 'Menzil, motor gücü ve ekspertiz bilgisini girin',
      badge: 'Alfa Garaj Güvencesiyle',
      battery: 95,
      price: '22.500 ₺',
      stockStatus: 'Stokta Mevcut',
      img: '/products/segway-scooter.svg',
      images: [],
    };
    setCatalog({ ...catalog, scooters: [newItem, ...catalog.scooters] });
    notify('Yeni araç eklendi. 3+ adet fotoğraf yükleyip "Değişiklikleri Kaydet" butonuna basın.');
  }

  function removeScooter(id: string) {
    if (!catalog) return;
    const next = { ...catalog, scooters: catalog.scooters.filter((s) => s.id !== id) };
    persistCatalog(next, 'Araç vitrinden kaldırıldı.');
  }

  function updatePartField<K extends keyof SparePartItem>(
    id: string,
    key: K,
    value: SparePartItem[K]
  ) {
    if (!catalog) return;
    setCatalog({
      ...catalog,
      parts: catalog.parts.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    });
  }

  function addPart() {
    if (!catalog) return;
    const newPart: SparePartItem = {
      id: `pt-${Date.now()}`,
      brand: 'ONVO',
      name: 'Yeni Yedek Parça Adı',
      code: 'YP-001',
      compat: 'Uyumlu modelleri yazın',
      stock: 10,
      price: '950 ₺',
      img: '/products/part-board.svg',
    };
    setCatalog({ ...catalog, parts: [newPart, ...catalog.parts] });
    notify('Yeni yedek parça eklendi. Düzenleyip "Değişiklikleri Kaydet" butonuna basın.');
  }

  function removePart(id: string) {
    if (!catalog) return;
    const next = { ...catalog, parts: catalog.parts.filter((p) => p.id !== id) };
    persistCatalog(next, 'Yedek parça silindi.');
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Yönetim paneli kontrol ediliyor...
      </div>
    );
  }

  if (!authenticated || !catalog) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-8 shadow-lg space-y-6">
          <div className="space-y-2 text-center">
            <img src="/logos/alfa-garaj.png" alt="Alfa Garaj" className="h-10 w-auto mx-auto" />
            <h1 className="text-lg font-bold text-slate-900 pt-2">Yönetim Paneli Girişi</h1>
            <p className="text-xs text-slate-500">
              Ürün, yedek parça, fiyat ve görsel düzenleme ekranına erişmek için yönetici şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Yönetici Şifresi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            {loginError && <p className="text-xs text-rose-600 font-medium">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer"
            >
              Panele Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Üst Yönetim Başlığı */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 elevated">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <img src="/logos/alfa-garaj.png" alt="Alfa Garaj" className="h-8 w-auto" />
              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold">
                Yönetim Paneli
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                  persistentInCloud
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {storageLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Her scooter ilanı için 3 veya daha fazla fotoğraf yükleyebilir, kapak fotoğrafını seçebilir ve fiyatları anında güncelleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Siteyi Görüntüle ↗
            </a>
            <button
              type="button"
              disabled={saving}
              onClick={() => persistCatalog(catalog)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Çıkış
            </button>
          </div>
        </div>

        {/* Modül Sekmeleri */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('scooters')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              tab === 'scooters' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sıfır & 2. El Scooterlar ({catalog.scooters.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('parts')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              tab === 'parts' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yedek Parçalar ({catalog.parts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
              tab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tema & Site Ayarları
          </button>
        </div>

        {/* SEKME 1: SCOOTER DÜZENLEME (ÇOKLU FOTOĞRAF DESTEKLİ: EN AZ 3+ YUVA) */}
        {tab === 'scooters' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Sıfır & 2. El Scooter Fiyat ve Çoklu Fotoğraf Yönetimi</h2>
                <p className="text-xs text-slate-500">
                  Her araç için 1., 2., 3. fotoğraf yuvalarını doldurabilir veya toplu seçimle birden fazla fotoğraf ekleyebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={addScooter}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer shrink-0"
              >
                + Yeni Scooter Ekle
              </button>
            </div>

            {catalog.scooters.map((s) => {
              const allImgs = getScooterImages(s);
              const realImgs =
                allImgs.length === 1 && isPlaceholderSvg(allImgs[0]) ? [] : allImgs;
              const slotCount = Math.max(3, realImgs.length);

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5"
                >
                  {/* Üst Kısım: Çoklu Fotoğraf Galerisi (En az 3 görünür yuva + Toplu Ekleme) */}
                  <div className="pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-slate-700">
                        Araç Fotoğrafları ({realImgs.length} yüklü • İlk sıradaki kapak görselidir)
                      </span>
                      <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                        <span>
                          {uploadingId === s.id
                            ? 'Fotoğraflar Yükleniyor...'
                            : '+ Çoklu Fotoğraf Seç / Ekle'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingId === s.id}
                          onChange={(e) => {
                            handleScooterImagesUpload(e.target.files, s.id);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {Array.from({ length: slotCount }).map((_, idx) => {
                        const imgUrl = realImgs[idx];
                        return imgUrl ? (
                          <div
                            key={`${s.id}-img-${idx}`}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-32"
                          >
                            <img
                              src={imgUrl}
                              alt={`${s.name} - ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold ${
                                idx === 0
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-900/75 text-white'
                              }`}
                            >
                              {idx === 0 ? '1. Kapak' : `${idx + 1}. Fotoğraf`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeScooterImage(s.id, idx)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                              title="Fotoğrafı Sil"
                            >
                              ✕
                            </button>
                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-slate-950/70 flex items-center justify-between gap-1">
                              {idx !== 0 ? (
                                <button
                                  type="button"
                                  onClick={() => makeCoverImage(s.id, idx)}
                                  className="text-[11px] font-semibold text-amber-300 hover:underline cursor-pointer"
                                >
                                  Kapak Yap
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-300 font-medium">
                                  Ana Vitrin
                                </span>
                              )}
                              <label className="cursor-pointer text-[11px] font-semibold text-white hover:underline">
                                Değiştir
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingId === s.id}
                                  onChange={(e) => {
                                    handleScooterImagesUpload(e.target.files, s.id, idx);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            key={`${s.id}-empty-${idx}`}
                            className="cursor-pointer h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/70 hover:bg-slate-100/70 flex flex-col items-center justify-center text-center p-3 transition-colors"
                          >
                            <span className="text-lg font-bold text-slate-400">+</span>
                            <span className="text-xs font-semibold text-slate-600 mt-0.5">
                              {idx + 1}. Fotoğraf Ekle
                            </span>
                            <span className="text-[11px] text-slate-400">Tıklayıp seçin</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              disabled={uploadingId === s.id}
                              onChange={(e) => {
                                handleScooterImagesUpload(e.target.files, s.id);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Alt Kısım: Ürün Bilgileri & Kaydet/Sil */}
                  <div className="grid md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-10 grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Model Başlığı
                        </label>
                        <input
                          value={s.name}
                          onChange={(e) => updateScooterField(s.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Fiyat
                        </label>
                        <input
                          value={s.price}
                          onChange={(e) => updateScooterField(s.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Durum
                        </label>
                        <select
                          value={s.cond}
                          onChange={(e) =>
                            updateScooterField(s.id, 'cond', e.target.value as ScooterCondition)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Sıfır">Sıfır Scooter</option>
                          <option value="2. El">2. El Garantili</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Marka
                        </label>
                        <select
                          value={s.brand}
                          onChange={(e) =>
                            updateScooterField(s.id, 'brand', e.target.value as BrandName)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Segway">Segway</option>
                          <option value="ONVO">ONVO</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Pil Sağlığı (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={s.battery}
                          onChange={(e) =>
                            updateScooterField(s.id, 'battery', Number(e.target.value || 100))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Garanti / Alt Etiket
                        </label>
                        <input
                          value={s.badge}
                          onChange={(e) => updateScooterField(s.id, 'badge', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Stok Durumu
                        </label>
                        <select
                          value={s.stockStatus}
                          onChange={(e) =>
                            updateScooterField(
                              s.id,
                              'stockStatus',
                              e.target.value as ScooterItem['stockStatus']
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Stokta Mevcut">Stokta Mevcut</option>
                          <option value="Sipariş Üzerine">Sipariş Üzerine</option>
                          <option value="Tükendi">Tükendi</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Teknik Özellikler / Ekspertiz Notu
                        </label>
                        <input
                          value={s.desc}
                          onChange={(e) => updateScooterField(s.id, 'desc', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex md:flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => persistCatalog(catalog)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => removeScooter(s.id)}
                        className="py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        İlanı Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SEKME 2: YEDEK PARÇA DÜZENLEME (TEK FOTOĞRAF YETERLİ) */}
        {tab === 'parts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Yedek Parça Fiyat, Stok ve Görsel Yönetimi</h2>
              <button
                type="button"
                onClick={addPart}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                + Yeni Yedek Parça Ekle
              </button>
            </div>

            {catalog.parts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 grid md:grid-cols-12 gap-5 items-center"
              >
                <div className="md:col-span-3 space-y-2">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-36 object-cover rounded-xl border border-slate-200 bg-slate-50"
                  />
                  <label className="cursor-pointer w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                    <span>
                      {uploadingId === p.id ? 'Yükleniyor...' : 'Parça Fotoğrafı Seç'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === p.id}
                      onChange={(e) => handlePartImageUpload(e.target.files?.[0], p.id)}
                    />
                  </label>
                </div>

                <div className="md:col-span-7 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Yedek Parça Adı
                    </label>
                    <input
                      value={p.name}
                      onChange={(e) => updatePartField(p.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Fiyat</label>
                    <input
                      value={p.price}
                      onChange={(e) => updatePartField(p.id, 'price', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Marka</label>
                    <select
                      value={p.brand}
                      onChange={(e) => updatePartField(p.id, 'brand', e.target.value as BrandName)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Segway">Segway</option>
                      <option value="ONVO">ONVO</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Parça Kodu
                    </label>
                    <input
                      value={p.code}
                      onChange={(e) => updatePartField(p.id, 'code', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Stok Adedi
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={p.stock}
                      onChange={(e) => updatePartField(p.id, 'stock', Number(e.target.value || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Uyumlu Modeller
                    </label>
                    <input
                      value={p.compat}
                      onChange={(e) => updatePartField(p.id, 'compat', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex md:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => persistCatalog(catalog)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => removePart(p.id)}
                    className="py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEKME 3: TEMA & İLETİŞİM AYARLARI */}
        {tab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Site Görünüm Teması</h2>
              <p className="text-xs text-slate-500 mt-1">
                Hazırlanan 4 kurumsal konseptten dilediğinizi tek tıkla canlı site teması olarak belirleyebilirsiniz.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {(
                  [
                    { k: 'c1', name: '1. Kurumsal Beyaz Showroom', desc: 'Ferah beyaz ve antrasit' },
                    { k: 'c2', name: '2. Lacivert & Buz Servis', desc: 'Kurumsal lacivert ve açık mavi' },
                    { k: 'c3', name: '3. Sıcak Kum Taşı', desc: 'Kırık beyaz ve koyu çam yeşili' },
                    { k: 'c4', name: '4. Mat Titanyum (Koyu)', desc: 'Göz yormayan mat koyu tema' },
                  ] as Array<{ k: ThemeKey; name: string; desc: string }>
                ).map((item) => (
                  <button
                    key={item.k}
                    type="button"
                    onClick={() =>
                      setCatalog({
                        ...catalog,
                        settings: { ...catalog.settings, theme: item.k },
                      })
                    }
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      catalog.settings.theme === item.k
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs opacity-75 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ana Telefon (Görünüm)
                </label>
                <input
                  value={catalog.settings.phoneDisplay}
                  onChange={(e) =>
                    setCatalog({
                      ...catalog,
                      settings: { ...catalog.settings, phoneDisplay: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  WhatsApp Numarası (Ülke Koduyla, Örn: 905321352815)
                </label>
                <input
                  value={catalog.settings.whatsappNumber}
                  onChange={(e) =>
                    setCatalog({
                      ...catalog,
                      settings: { ...catalog.settings, whatsappNumber: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Adres</label>
                <input
                  value={catalog.settings.address}
                  onChange={(e) =>
                    setCatalog({
                      ...catalog,
                      settings: { ...catalog.settings, address: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Çalışma Saatleri
                </label>
                <input
                  value={catalog.settings.workingHours}
                  onChange={(e) =>
                    setCatalog({
                      ...catalog,
                      settings: { ...catalog.settings, workingHours: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => persistCatalog(catalog)}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold cursor-pointer"
            >
              Ayarları Kaydet
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium bg-slate-900 text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
