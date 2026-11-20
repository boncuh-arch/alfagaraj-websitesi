import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { uploadImageAsset } from '@/lib/catalogStore';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Geçerli bir görsel dosyası seçilmedi.' }, { status: 400 });
    }

    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'Görsel boyutu 6 MB sınırını aşamaz.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const url = await uploadImageAsset(buffer, file.type || 'image/webp', file.name || 'urun.webp');

    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ error: 'Görsel yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
