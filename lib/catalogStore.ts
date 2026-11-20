import fs from 'fs/promises';
import path from 'path';
import { CatalogData } from '@/lib/types';
import { DEFAULT_CATALOG } from '@/data/defaultCatalog';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'catalog.json');
const BLOB_API_BASE = 'https://blob.vercel-storage.com';
const BLOB_CATALOG_KEY = 'alfa-garaj/catalog.json';

// Sunucu içi sıcak önbellek (Vercel serverless soğuk başlangıçlarına kadar anlık yanıt sağlar)
let memoryCache: CatalogData | null = null;

export type StorageBackendInfo = {
  mode: 'vercel-blob' | 'local-file' | 'ephemeral-memory';
  persistentInCloud: boolean;
  label: string;
};

export function getStorageInfo(): StorageBackendInfo {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      mode: 'vercel-blob',
      persistentInCloud: true,
      label: 'Vercel Blob Bulut Depolama Aktif (Kalıcı)',
    };
  }
  if (process.env.VERCEL !== '1') {
    return {
      mode: 'local-file',
      persistentInCloud: true,
      label: 'Yerel Disk Depolama Aktif (data/catalog.json)',
    };
  }
  return {
    mode: 'ephemeral-memory',
    persistentInCloud: false,
    label: 'Geçici Sunucu Belleği (Kalıcı kayıt için Vercel Storage -> Blob bağlayın)',
  };
}

async function readFromVercelBlob(token: string): Promise<CatalogData | null> {
  try {
    const listRes = await fetch(
      `${BLOB_API_BASE}?prefix=${encodeURIComponent(BLOB_CATALOG_KEY)}&limit=5`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'x-api-version': '7',
        },
        cache: 'no-store',
      }
    );
    if (!listRes.ok) return null;
    const listJson = await listRes.json();
    const blobs: Array<{ pathname: string; url: string }> = listJson?.blobs || [];
    const exact = blobs.find((b) => b.pathname === BLOB_CATALOG_KEY) || blobs[0];
    if (!exact?.url) return null;

    const dataRes = await fetch(`${exact.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!dataRes.ok) return null;
    return (await dataRes.json()) as CatalogData;
  } catch {
    return null;
  }
}

async function writeToVercelBlob(token: string, data: CatalogData): Promise<boolean> {
  try {
    const body = JSON.stringify(data, null, 2);
    const putRes = await fetch(`${BLOB_API_BASE}/${BLOB_CATALOG_KEY}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'x-api-version': '7',
        'x-content-type': 'application/json',
        'x-add-random-suffix': '0',
        'x-cache-control-max-age': '0',
      },
      body,
    });
    return putRes.ok;
  } catch {
    return false;
  }
}

export async function uploadImageAsset(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // 1. Vercel Blob bağlıysa doğrudan CDN'e yükle
  if (blobToken) {
    const key = `alfa-garaj/images/${Date.now()}-${safeName}`;
    const res = await fetch(`${BLOB_API_BASE}/${key}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${blobToken}`,
        'x-api-version': '7',
        'x-content-type': mimeType || 'image/webp',
        'x-add-random-suffix': '1',
      },
      body: new Uint8Array(buffer),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.url) return json.url as string;
    }
  }

  // 2. Yerel geliştirme ortamındaysa public/uploads klasörüne kaydet
  if (process.env.VERCEL !== '1') {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const finalFile = `${Date.now()}-${safeName}`;
      await fs.writeFile(path.join(uploadDir, finalFile), buffer);
      return `/uploads/${finalFile}`;
    } catch {
      // Yazılamazsa data URI fallback'e geç
    }
  }

  // 3. Fallback: İstemcide sıkıştırılmış görseli doğrudan veri URL'si olarak döndür
  return `data:${mimeType || 'image/webp'};base64,${buffer.toString('base64')}`;
}

export async function getCatalog(): Promise<CatalogData> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const fromBlob = await readFromVercelBlob(blobToken);
    if (fromBlob) {
      memoryCache = fromBlob;
      return fromBlob;
    }
  }

  if (memoryCache) return memoryCache;

  try {
    const raw = await fs.readFile(LOCAL_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CatalogData;
    memoryCache = parsed;
    return parsed;
  } catch {
    memoryCache = DEFAULT_CATALOG;
    return DEFAULT_CATALOG;
  }
}

export async function saveCatalog(nextData: CatalogData): Promise<{ saved: boolean; mode: string }> {
  const payload: CatalogData = {
    ...nextData,
    updatedAt: new Date().toISOString(),
  };
  memoryCache = payload;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const ok = await writeToVercelBlob(blobToken, payload);
    return { saved: ok, mode: 'vercel-blob' };
  }

  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return { saved: true, mode: 'local-file' };
  } catch {
    return { saved: true, mode: 'ephemeral-memory' };
  }
}
