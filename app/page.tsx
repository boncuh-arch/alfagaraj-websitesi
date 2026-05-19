"use client";

import React, { useState } from 'react';

export default function Home() {
  // Seçili marka filtresi için durum kontrolü (Hepsini göster, sadece Onvo veya sadece Segway/Citycoco)
  const [seciliMarka, setSeciliMarka] = useState('HEPSİ');

  // Showroom'da sergilenecek popüler scooter ve e-mobilite modelleri veri havuzu
  const modeller = [
    {
      id: 1,
      marka: 'ONVO',
      ad: 'Onvo OV-012 Ers',
      kategori: 'E-Scooter',
      menzil: '45-50 KM',
      hiz: '45 KM/H',
      guc: '800W',
      stok: 'Mevcut',
      gorsel: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600', // Temsili yüksek kalite scooter görseli
    },
    {
      id: 2,
      marka: 'SEGWAY',
      ad: 'Ninebot KickScooter MAX G2',
      kategori: 'E-Scooter',
      menzil: '70 KM',
      hiz: '25 KM/H',
      guc: '450W (Max 900W)',
      stok: 'Mevcut',
      gorsel: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      marka: 'CITYCOCO',
      ad: 'Citycoco Comfort S',
      kategori: 'E-Motorcycle',
      menzil: '60 KM',
      hiz: '45 KM/H',
      guc: '2000W',
      stok: 'Sipariş Üzerine',
      gorsel: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      marka: 'ONVO',
      ad: 'Onvo OV-011',
      kategori: 'E-Scooter',
      menzil: '35-40 KM',
      hiz: '35 KM/H',
      guc: '500W',
      stok: 'Mevcut',
      gorsel: 'https://images.unsplash.com/photo-1597843797221-34448dc39097?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 5,
      marka: 'SEGWAY',
      ad: 'Ninebot F2 Pro',
      kategori: 'E-Scooter',
      menzil: '55 KM',
      hiz: '25 KM/H',
      guc: '400W',
      stok: 'Tükendi',
      gorsel: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=600',
    }
  ];

  // Seçilen markaya göre modelleri filtreleme mekanizması
  const filtrelenmisModeller = seciliMarka === 'HEPSİ' 
    ? modeller 
    : modeller.filter(m => m.marka === seciliMarka);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-orange-500 selection:text-black">
      
      {/* GÖRÜNMEZ SEO VE DOĞRULAMA ALANI */}
      <head>
        <title>Alfa Garaj | Gebze Elektrikli Scooter Showroom & Yetkili Servis</title>
        <meta name="google-site-verification" content="Qqxue1O21lq5cLP1zjNuTYvM-qmHE-t66P9Bq0bgkvQ" />
        <meta name="description" content="Gebze Onvo, Segway ve Citycoco elektrikli araç modelleri, sıfır ve ikinci el stok durumu, profesyonel teknik servis ve batarya onarımı." />
      </head>

      {/* NAVBAR / ÜST MENÜ */}
      <nav className="border-b border-white/5 bg-[#090a0f]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center">
            {/* Logonun orijinal renklerini patlatmayan şık panel */}
            <div className="bg-white p-1.5 rounded-xl flex items-center justify-center shadow-lg shadow-orange-550/5">
              <img src="/logo.png" alt="Alfa Garaj Logo" className="h-9 w-auto object-contain" />
            </div>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#showroom" className="hover:text-orange-500 transition-colors">Showroom</a>
            <a href="#hizmetler" className="hover:text-orange-500 transition-colors">Teknik Servis</a>
            <a href="#iletisim" className="hover:text-orange-500 transition-colors">İletişim</a>
          </div>
        </div>
      </nav>

      {/* YENİ GÜÇLÜ GİRİŞ ALANI (HERO) */}
      <header className="relative py-24 md:py-36 flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-2xl max-w-xs flex items-center justify-center border border-white/10">
          <img src="/logo.png" alt="Alfa Garaj Büyük Vitrin" className="w-full h-auto object-contain" />
        </div>

        <span className="text-orange-500 font-bold tracking-[0.2em] uppercase text-[10px] bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20 mb-6">
          Kocaeli Gebze Bölge Bayii & Teknik Servis Merkezî
        </span>
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase max-w-5xl leading-none">
          GEBZE MİKRO MOBİLİTE <br />
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">TEKNOLOJİ ÜSSÜ</span>
        </h1>
        
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-12 font-medium leading-relaxed">
          Onvo, Segway ve Citycoco resmi güvencesiyle sıfır araç satışı, orijinal yedek parça ve ileri düzey batarya/motor laboratuvar hizmetleri.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <a href="#showroom" className="bg-orange-500 hover:bg-orange-600 text-black font-black px-12 py-4 rounded-xl uppercase tracking-wider text-sm transition-all shadow-xl shadow-orange-500/10">
            Modelleri İncele
          </a>
          <a href="https://wa.me/905321352815" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 text-white font-bold px-12 py-4 rounded-xl border border-white/10 text-sm transition-all">
            Hızlı Teknik Destek Al
          </a>
        </div>
      </header>

      {/* DİNAMİK SHOWROOM SEKSİYONU (YENİ EKLEDİĞİMİZ ALAN) */}
      <section id="showroom" className="py-24 bg-[#0c0d14] border-b border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">GÜNCEL ARAÇ VİTRİNİ</h2>
              <p className="text-slate-400 mt-2 text-sm">Dükkanımızda bulunan veya sipariş üzerine hemen teslim edilen popüler modeller</p>
            </div>
            
            {/* Marka Filtreleme Butonları */}
            <div className="flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
              {['HEPSİ', 'ONVO', 'SEGWAY', 'CITYCOCO'].map((marka) => (
                <button
                  key={marka}
                  onClick={() => setSeciliMarka(marka)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
                    seciliMarka === marka 
                      ? 'bg-orange-500 text-black shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {marka}
                </button>
              ))}
            </div>
          </div>

          {/* Model Kartlarının Listelendiği Grid Yapı */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrelenmisModeller.map((model) => (
              <div key={model.id} className="bg-[#12141c] rounded-2xl border border-white/5 overflow-hidden hover:border-orange-500/30 transition-all flex flex-col group">
                {/* Araç Görsel Alanı */}
                <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
                  <img 
                    src={model.gorsel} 
                    alt={model.ad} 
                    className="w-full height-full object-cover group-hover:scale-105 transition-transform duration-500 h-full"
                  />
                  <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    model.stok === 'Mevcut' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    model.stok === 'Tükendi' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {model.stok}
                  </span>
                </div>

                {/* Araç Bilgileri */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">{model.marka} • {model.kategori}</span>
                    <h3 className="text-xl font-extrabold mt-1 text-white uppercase tracking-tight tracking-tighter">{model.ad}</h3>
                    
                    {/* Teknik Özellik Özeti */}
                    <div className="grid grid-cols-3 gap-2 mt-6 bg-black/30 p-3 rounded-xl border border-white/5 text-center text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Menzil</span>
                        <span className="font-bold text-slate-200 mt-0.5 block">{model.menzil}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Maks Hız</span>
                        <span className="font-bold text-slate-200 mt-0.5 block">{model.hiz}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Güç</span>
                        <span className="font-bold text-slate-200 mt-0.5 block">{model.guc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Stok & Fiyat Bilgisi İçin:</span>
                    <a 
                      href={`https://wa.me/905321352815?text=Merhaba%20Alfa%20Garaj,%20${model.ad}%20modelinizin%20g%C3%BCncel%20stok%20ve%20fiyat%C4%B1%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim?`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-black uppercase text-orange-400 hover:text-orange-500 flex items-center gap-1 transition-colors"
                    >
                      WhatsApp Sor ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TEKNİK SERVİS HİZMETLERİMİZ */}
      <section id="hizmetler" className="py-24 container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl uppercase">İleri Düzey Laboratuvar & Onarım</h2>
          <p className="text-slate-400 mt-2 text-sm">Elektrikli araçlarınız için sadece bakım değil, mühendislik çözümleri sunuyoruz</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#12141c] rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              🔋
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Batarya & BMS Revizyonu</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Lithium paket imalatı, nokta lazer kaynak, hücre eşleme arıza tespiti ve orijinal akıllı BMS devre kartı onarımları.
            </p>
          </div>

          <div className="p-8 bg-[#12141c] rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Motor & Sürücü Onarımı</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hub motor sarımı, hall sensör kalibrasyonu, mosfet sürücü (controller) beyin tamirleri ve marka yazılımları yükleme.
            </p>
          </div>

          <div className="p-8 bg-[#12141c] rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              🔧
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Periyodik Hat & Mekanik</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dolgu lastik presleme, disk hidrolik fren kalibrasyonu, kronik katlanma mekanizması güçlendirme operasyonları.
            </p>
          </div>
        </div>
      </section>

      {/* İLETİŞİM & ADRES BÖLÜMÜ */}
      <footer id="iletisim" className="py-20 border-t border-white/5 bg-[#0c0d14]">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-orange-500">Alfa Garaj Gebze</h2>
          <p className="text-slate-300 text-lg mb-1">Hacı Halil Mah. Adliye Cad. No:33 (Adliye Yanı)</p>
          <p className="text-slate-500 mb-10 uppercase tracking-widest text-xs">Gebze / KOCAELİ</p>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Müşteri İlişkileri & Teknik Servis</span>
            <a href="tel:+905321352815" className="text-4xl md:text-5xl font-black tracking-tighter text-white hover:text-orange-500 transition-colors">
              0532 135 28 15
            </a>
            <p className="text-slate-500 text-xs mt-4">Pazartesi - Cumartesi: 09:00 - 19:00</p>
          </div>

          <div className="sr-only">
            <span>Gebze Scooter Tamiri</span> • <span>Gebze Scuter Servisi</span> • <span>Gebze Sukuter Onarımı</span> • <span>Onvo Servis Gebze</span> • <span>Segway Servis Kocaeli</span> • <span>Citycoco Tamir Merkezî</span>
          </div>
        </div>
      </footer>

    </div>
  );
}