"use client";

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-orange-500">
      
      {/* NAVBAR / ÜST MENÜ */}
      <nav className="border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center">
            {/* Logonun orijinal renklerini korumak için beyaz bir kapsayıcı kutu eklendi */}
            <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center shadow-md">
              <img 
                src="/logo.png" 
                alt="Alfa Garaj Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-neutral-400">
            <a href="#hizmetler" className="hover:text-orange-500 transition-colors">Hizmetler</a>
            <a href="#markalar" className="hover:text-orange-500 transition-colors">Markalar</a>
            <a href="#iletisim" className="hover:text-orange-500 transition-colors">İletişim</a>
          </div>
        </div>
      </nav>

      {/* GİRİŞ / HERO SECTION */}
      <header className="relative py-20 md:py-28 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.12)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Ortadaki Büyük Logo Alanı - Beyaz arka plan sorununu çözen kurumsal panel */}
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-2xl border border-white/20 max-w-xs md:max-w-sm flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Alfa Garaj Büyük Logo" 
            className="w-full h-auto object-contain" 
          />
        </div>

        <span className="text-orange-500 font-semibold tracking-widest uppercase text-xs bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20 mb-6">
          Gebze Yetkili Bayi & Teknik Servis
        </span>
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase max-w-4xl leading-none">
          E-Scooter Teknoloji <span className="text-orange-500">Servis Merkezi</span>
        </h1>
        
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mb-10 font-medium">
          Onvo, Segway ve Citycoco modelleriniz için profesyonel batarya (BMS) tamiri, hub motor onarımı ve garantili periyodik bakım çözümleri.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <a 
            href="https://wa.me/905321352815?text=Merhaba%20Alfa%20Garaj,%20scooter%20servis%20hizmeti%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-orange-500 hover:bg-orange-600 text-black font-black px-10 py-4 rounded-xl uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
          >
            WhatsApp Servis Hattı
          </a>
          <a href="#iletisim" className="bg-white/5 hover:bg-white/10 text-white font-bold px-10 py-4 rounded-xl border border-white/10 transition-all">
            İletişim ve Konum
          </a>
        </div>
      </header>

      {/* MARKALAR */}
      <section id="markalar" className="py-16 bg-neutral-900 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="text-center text-neutral-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">YETKİLİ BAYİSİ VE SERVİSİ OLDUĞUMUZ MARKALAR</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            <div className="text-2xl md:text-4xl font-black italic tracking-tighter text-neutral-300">ONVO</div>
            <div className="text-2xl md:text-4xl font-black tracking-tighter text-orange-500">SEGWAY</div>
            <div className="text-2xl md:text-4xl font-black italic tracking-tighter text-neutral-300">CITYCOCO</div>
          </div>
        </div>
      </section>

      {/* HİZMETLERİMİZ */}
      <section id="hizmetler" className="py-24 container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl uppercase">Uzmanlık Alanlarımız</h2>
          <p className="text-neutral-400 mt-2">Elektrikli scooter, e-bike ve mikro-mobilite araçlarınız için profesyonel atölye desteği</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* KART 1 */}
          <div className="p-8 bg-neutral-900 rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              🔋
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Batarya & BMS Tamiri</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Lithium hücre değişimi, nokta kaynak, hassas kapasite testleri, BMS arızaları onarımı ve menzil artırımı (ek batarya) uygulamaları.
            </p>
          </div>

          {/* KART 2 */}
          <div className="p-8 bg-neutral-900 rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Motor & Beyin Onarımı</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Hub motor mekanik ve kablo arızaları, hall sensör değişimi, sürücü kartı (controller) tamiri ogüncel yazılım güncellemeleri.
            </p>
          </div>

          {/* KART 3 */}
          <div className="p-8 bg-neutral-900 rounded-2xl border border-white/5 hover:border-orange-500/40 transition-all group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold text-xl mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
              🔧
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">Mekanik Bakım & Lastik</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Dolgu lastik veya şambrel değişimi, hidrolik/mekanik fren sistemleri ayarı, amortisör bakımı ve güvenli sürüş için sıkılık kontrolü.
            </p>
          </div>
        </div>
      </section>

      {/* İLETİŞİM & ADRES BÖLÜMÜ */}
      <footer id="iletisim" className="py-20 border-t border-white/5 bg-neutral-950">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-orange-500">Alfa Garaj Gebze</h2>
          <p className="text-neutral-300 text-lg mb-1">Hacı Halil Mah. Adliye Cad. No:33</p>
          <p className="text-neutral-500 mb-10 uppercase tracking-widest text-xs">Gebze / KOCAELİ</p>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Müşteri Destek & Servis Hattı</span>
            <a href="tel:+905321352815" className="text-4xl md:text-5xl font-black tracking-tighter text-white hover:text-orange-500 transition-colors">
              0532 135 28 15
            </a>
            <p className="text-neutral-400 text-sm mt-4">Pazartesi - Cumartesi: 09:00 - 19:00</p>
          </div>
        </div>
      </footer>

    </div>
  );
}