# Alfa Garaj — Gebze Segway & ONVO Servis, Yedek Parça ve Scooter Mağazası

Canlı adres: `https://alfagaraj-websitesi.vercel.app`

## Özellikler
- **Canlı Servis Durumu Sorgulama (`/api/servis-sorgula`):** `alfaservis.vercel.app/api/track` ile doğrudan konuşarak telefon numarası veya servis fiş koduyla gerçek cihaz aşamasını, kabul/onarım/teslim fotoğraflarını ve ücret detayını getirir.
- **Sıfır & Garantili 2. El Scooter Vitrini (`/scooterlar`):** Segway ve ONVO modelleri için durum ve marka filtreli vitrin.
- **Yedek Parça Mağazası (`/yedek-parca`):** Marka filtreli, parça kodlu ve WhatsApp sepet tamamlama destekli mağaza.
- **İzole Yönetim Paneli (`/yonetim`):** Müşteri menüsünde linki yer almayan, `robots.txt` ve `noindex` ile arama motorlarına kapatılmış şifre korumalı ürün, yedek parça, fiyat, stok, fotoğraf ve site teması düzenleme ekranı.

## Ortam Değişkenleri (Vercel Environment Variables)
- `ADMIN_PASSWORD`: `/yonetim` paneline giriş şifresi (Belirtilmezse varsayılan kurulum şifresi kullanılır; canlıda mutlaka kendi şifrenizi tanımlayın).
- `BLOB_READ_WRITE_TOKEN`: Vercel proje panelinden **Storage → Create Database → Blob** bağlandığında otomatik eklenir; yüklenen ürün görsellerinin ve fiyat değişikliklerinin bulutta kalıcı saklanmasını sağlar.
- `ALFA_SERVIS_URL`: Varsayılan `https://alfaservis.vercel.app`.
