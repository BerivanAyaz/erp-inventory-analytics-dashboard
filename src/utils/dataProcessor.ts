import Papa from 'papaparse';

export interface ERPData {
  stok_kodu: string;
  urun_adi: string;
  kategori: string;
  depo: string;
  donem: string;
  giris_miktar: number;
  cikis_miktar: number;
  donem_sonu_stok: number;
  birim_maliyet_tl: number;
  birim_satis_tl: number;
}

export const processCSVData = async (csvText: string) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      error: (err: any) => {
        // Hata Yönetimi: Dosya formatı bozuksa sistemi çökertme, hatayı yakala.
        console.error("CSV Ayrıştırma Hatası:", err);
        reject(new Error("Dosya formatı hatalı veya okunamadı."));
      },
      complete: (results) => {
        const rawData = results.data as any[];
        const cleanData: ERPData[] = [];
        
        // BONUS: Gelişmiş Anomali Raporu Tutucu
        const anomalies = {
          doldurulanEksikVeri: 0,
          kopyaKayitSayisi: 0,
          stokTukenmeRiski: 0,
          kritikHataSayisi: 0,
          silinenSatirSayisi: 0,
          temizlenenSatirlar: [] as string[]
        };

        const uniqueKeys = new Set<string>();

        // Sayıları güvenle parse eder, geçersiz/boş ise 'null' döndürür
        const safeParseNumber = (val: any): number | null => {
          if (val === null || val === undefined || val === '') return null;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleanString = val.replace(/\./g, '').replace(',', '.');
            const num = Number(cleanString);
            return isNaN(num) ? null : num;
          }
          return null;
        };

        rawData.forEach((row, index) => {
          const satirNo = index + 1;

          const stokKodu = row.stok_kodu?.toString().trim();
          let donem = row.donem?.toString().trim();

          // 1. GÜVENLİK KİLİDİ (Guardrail - Hayati veriler yoksa satır yoksayılır)
          if (!stokKodu || !donem) {
            anomalies.silinenSatirSayisi++;
            anomalies.temizlenenSatirlar.push(`Satır ${satirNo}: Stok Kodu veya Dönem eksik olduğu için satır yoksayıldı.`);
            return;
          }

          // Dönem formatlaması ('01/2026' veya '2026-1' gibi hataları '2026-01' yapar)
          if (donem.includes('/')) {
              const [ay, yil] = donem.split('/');
              donem = `${yil}-${ay.padStart(2, '0')}`;
          }

          // 2. KOPYA (MÜKERRER) KONTROLÜ
          const uniqueKey = `${stokKodu}-${donem}`;
          if (uniqueKeys.has(uniqueKey)) {
            anomalies.kopyaKayitSayisi++;
            anomalies.temizlenenSatirlar.push(`Satır ${satirNo}: ${stokKodu} (${donem}) mükerrer kayıt engellendi.`);
            return; 
          }
          uniqueKeys.add(uniqueKey);

          // 3. EKSİK VERİ TAMAMLAMA (Data Science / Trend Koruma Yaklaşımı)
          let gMiktar = safeParseNumber(row.giris_miktar);
          let cMiktar = safeParseNumber(row.cikis_miktar);
          let stok = safeParseNumber(row.donem_sonu_stok);
          let maliyet = safeParseNumber(row.birim_maliyet_tl);
          let satis = safeParseNumber(row.birim_satis_tl);

          // Rakamlarda eksiklik varsa satırı silme, trend kopmasın diye 0 ile tamamla
          if (gMiktar === null || cMiktar === null || stok === null || maliyet === null || satis === null) {
              anomalies.doldurulanEksikVeri++;
              gMiktar = gMiktar ?? 0;
              cMiktar = cMiktar ?? 0;
              stok = stok ?? 0;
              maliyet = maliyet ?? 0;
              satis = satis ?? 0;
              anomalies.temizlenenSatirlar.push(`Satır ${satirNo}: ${stokKodu} (${donem}) eksik metrikler trendi korumak için 0 ile tamamlandı.`);
          }

          // 4. MANTIKSAL HATALAR VE RİSK YÖNETİMİ
          if (stok < 0) {
             anomalies.kritikHataSayisi++;
             stok = 0; // Stok eksiye düşemez, 0'a çekiyoruz.
             anomalies.temizlenenSatirlar.push(`Satır ${satirNo}: Negatif stok (${stokKodu}) 0'a eşitlendi.`);
          }

          if (maliyet < 0) {
             maliyet = 0; // Negatif maliyet hesaplamaları bozar
          }

          if (stok > 0 && stok < 50) {
            anomalies.stokTukenmeRiski++;
          }

          // 5. GÜVENLİ SATIRI DİZİYE EKLE (Açıklayıcı verilerde null varsa varsayılan değer atanır)
          cleanData.push({
            stok_kodu: stokKodu,
            urun_adi: row.urun_adi?.toString().trim() || "Bilinmeyen Ürün",
            kategori: row.kategori?.toString().trim() || "Belirtilmemiş",
            depo: row.depo?.toString().trim() || "Genel Depo",
            donem: donem,
            giris_miktar: gMiktar,
            cikis_miktar: cMiktar,
            donem_sonu_stok: stok,
            birim_maliyet_tl: maliyet,
            birim_satis_tl: satis
          });
        });

        resolve({ cleanData, anomalies });
      },
    });
  });
};