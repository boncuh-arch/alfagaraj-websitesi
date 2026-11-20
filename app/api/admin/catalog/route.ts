import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getCatalog, getStorageInfo, saveCatalog } from '@/lib/catalogStore';
import { CatalogData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  const catalog = await getCatalog();
  const storage = getStorageInfo();
  return NextResponse.json({ catalog, storage });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  try {
    const incoming = (await req.json()) as CatalogData;
    if (!incoming || !Array.isArray(incoming.scooters) || !Array.isArray(incoming.parts)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı.' }, { status: 400 });
    }
    const result = await saveCatalog(incoming);
    return NextResponse.json({ ok: true, ...result, storage: getStorageInfo() });
  } catch {
    return NextResponse.json({ error: 'Katalog kaydedilirken bir hata oluştu.' }, { status: 500 });
  }
}
