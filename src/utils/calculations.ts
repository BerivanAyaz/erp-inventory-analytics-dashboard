import { ERPData } from './dataProcessor';

export const calculateKPIs = (data: ERPData[]) => {
  if (!data || data.length === 0) {
    return { toplamSatisHacmi: 0, toplamCiro: 0, toplamKar: 0, toplamMaliyet: 0, ortalamaKarMarji: "0.00" };
  }

  let toplamSatisHacmi = 0;
  let toplamCiro = 0;
  let toplamMaliyet = 0;

  data.forEach((row) => {
    toplamSatisHacmi += row.cikis_miktar;
    toplamCiro += (row.cikis_miktar * row.birim_satis_tl);
    toplamMaliyet += (row.cikis_miktar * row.birim_maliyet_tl);
  });

  const toplamKar = toplamCiro - toplamMaliyet;
  const ortalamaKarMarji = toplamCiro > 0 ? (toplamKar / toplamCiro) * 100 : 0;

  return {
    toplamSatisHacmi,
    toplamCiro,
    toplamKar,
    toplamMaliyet,
    ortalamaKarMarji: ortalamaKarMarji.toFixed(2)
  };
};

export const calculateMonthlyTrends = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const groupedData: Record<string, { donem: string; toplamSatis: number; donemSonuStok: number }> = {};

  data.forEach((row) => {
    if (!groupedData[row.donem]) {
      groupedData[row.donem] = { donem: row.donem, toplamSatis: 0, donemSonuStok: 0 };
    }
    groupedData[row.donem].toplamSatis += row.cikis_miktar;
    groupedData[row.donem].donemSonuStok += row.donem_sonu_stok;
  });

  return Object.values(groupedData).sort((a, b) => a.donem.localeCompare(b.donem));
};

export const calculateCategoryPerformance = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const categoryMap: Record<string, number> = {};

  data.forEach((row) => {
    const kat = row.kategori || "Diğer";
    const ciro = row.cikis_miktar * row.birim_satis_tl;
    if (!categoryMap[kat]) categoryMap[kat] = 0;
    categoryMap[kat] += ciro;
  });

  return Object.keys(categoryMap).map(kategori => ({
    kategori,
    toplamCiro: categoryMap[kategori]
  }));
};

// Depo performans analizi 
export const calculateDepotPerformance = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const depotMap: Record<string, { toplamSatis: number; toplamStok: number }> = {};

  data.forEach((row) => {
    const depo = row.depo || "Genel Depo";
    if (!depotMap[depo]) depotMap[depo] = { toplamSatis: 0, toplamStok: 0 };
    depotMap[depo].toplamSatis += row.cikis_miktar;
    depotMap[depo].toplamStok += row.donem_sonu_stok;
  });

  return Object.keys(depotMap).map(depo => ({
    depo,
    toplamSatis: depotMap[depo].toplamSatis,
    toplamStok: depotMap[depo].toplamStok
  }));
};

export const identifyRisks = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];
  
  const donemler = [...new Set(data.map(d => d.donem))].sort();
  const sonDonem = donemler[donemler.length - 1];
  const oncekiDonem = donemler.length > 1 ? donemler[donemler.length - 2] : null;
  
  const sonDonemVerileri = data.filter(d => d.donem === sonDonem);
  const oncekiDonemVerileri = oncekiDonem ? data.filter(d => d.donem === oncekiDonem) : [];
  
  const riskliUrunler: any[] = [];

  sonDonemVerileri.forEach((row) => {
    const satisFiyati = row.birim_satis_tl > 0 ? row.birim_satis_tl : 1; 
    const mevcutKarMarji = ((satisFiyati - row.birim_maliyet_tl) / satisFiyati) * 100;
    
    let riskEtiketleri: string[] = [];
    let riskSeviyesi = "Düşük";
    let oncelikPuani = 10;

    // 1. Önceki Döneme Göre Marj Daralması Kontrolü
    let daralanMarjMi = false;
    let oncekiKarMarjiVal = 0;
    if (oncekiDonem) {
      const oncekiUrun = oncekiDonemVerileri.find(u => u.stok_kodu === row.stok_kodu);
      if (oncekiUrun) {
        const oncekiSatisFiyati = oncekiUrun.birim_satis_tl > 0 ? oncekiUrun.birim_satis_tl : 1;
        oncekiKarMarjiVal = ((oncekiSatisFiyati - oncekiUrun.birim_maliyet_tl) / oncekiSatisFiyati) * 100;
        if ((oncekiKarMarjiVal - mevcutKarMarji) > 2) {
          daralanMarjMi = true;
        }
      }
    }

    // 2. Stok Durumu Kontrolleri
    if (row.donem_sonu_stok === 0) {
      riskEtiketleri.push("Kritik: Stok Tükendi (Stock-out)");
      riskSeviyesi = "Kritik";
      oncelikPuani = 1;
    } else if (row.donem_sonu_stok > 0 && row.donem_sonu_stok <= 50) {
      riskEtiketleri.push("Stok Tükenme Riski");
      riskSeviyesi = "Kritik";
      oncelikPuani = 2;
    }

    // 3. Yavaş Hareket Eden Kontrolü
    if (row.cikis_miktar < 50 && row.donem_sonu_stok > 500) {
      riskEtiketleri.push("Yavaş Hareket Eden / Atıl Stok");
      if (riskSeviyesi !== "Kritik") riskSeviyesi = "Uyarı";
      oncelikPuani = Math.min(oncelikPuani, 3);
    }

    // 4. Daralan veya Düşük Marj Kontrolü 
    if (daralanMarjMi) {
      riskEtiketleri.push(`Daralan Kâr Marjı (Önceki: %${oncekiKarMarjiVal.toFixed(1)})`);
      if (riskSeviyesi !== "Kritik") riskSeviyesi = "Uyarı";
      oncelikPuani = Math.min(oncelikPuani, 4);
    } else if (mevcutKarMarji < 35) {
      riskEtiketleri.push("Düşük Kâr Marjı Baskısı");
      if (riskSeviyesi !== "Kritik") riskSeviyesi = "Uyarı";
      oncelikPuani = Math.min(oncelikPuani, 5);
    }

    // Eğer herhangi bir risk tespit edildiyse birleştirip listeye ekle
    if (riskEtiketleri.length > 0) {
      riskliUrunler.push({
        stokKodu: row.stok_kodu,
        urunAdi: row.urun_adi,
        riskTuru: riskEtiketleri.join(" + "), // Örn: "Stok Tükenme Riski + Daralan Kâr Marjı"
        riskSeviyesi,
        karMarji: mevcutKarMarji.toFixed(1),
        stok: row.donem_sonu_stok,
        oncelikPuani
      });
    }
  });

  return riskliUrunler.sort((a, b) => a.oncelikPuani - b.oncelikPuani || a.stok - b.stok);
};

// 6 Aylık Kategori Bazlı Ciro Trendi Hesaplama 
export const calculateCategoryTrends = (data: any[]) => {
  if (!data || data.length === 0) return [];

  const periodMap: Record<string, { donem: string; [key: string]: any }> = {};

  data.forEach((row) => {
    if (!periodMap[row.donem]) {
      periodMap[row.donem] = { donem: row.donem };
    }
    const ciro = row.cikis_miktar * row.birim_satis_tl;
    if (!periodMap[row.donem][row.kategori]) {
      periodMap[row.donem][row.kategori] = 0;
    }
    periodMap[row.donem][row.kategori] += ciro;
  });

  return Object.values(periodMap).sort((a, b) => String(a.donem).localeCompare(String(b.donem)));
};

// 6 Aylık Depo Bazlı Çıkış/Sevkiyat Trendi
export const calculateDepotTrends = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const periodMap: Record<string, { donem: string; [key: string]: any }> = {};

  data.forEach((row) => {
    if (!periodMap[row.donem]) {
      periodMap[row.donem] = { donem: row.donem };
    }
    // Depo bazlı toplam çıkış (sevkiyat) hacmi
    if (!periodMap[row.donem][row.depo]) {
      periodMap[row.donem][row.depo] = 0;
    }
    periodMap[row.donem][row.depo] += row.cikis_miktar;
  });

  return Object.values(periodMap).sort((a, b) => String(a.donem).localeCompare(String(b.donem)));
};

// Dönemsel Kâr Marjı ve Maliyet Trendi Hesaplama
export const calculateMarginTrends = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const periodMap: Record<string, { donem: string; toplamKarMarji: number; toplamMaliyet: number; toplamSatisFiyati: number; count: number }> = {};

  data.forEach((row) => {
    if (!periodMap[row.donem]) {
      periodMap[row.donem] = { donem: row.donem, toplamKarMarji: 0, toplamMaliyet: 0, toplamSatisFiyati: 0, count: 0 };
    }
    const birimKar = row.birim_satis_tl - row.birim_maliyet_tl;
    const karMarji = row.birim_satis_tl > 0 ? (birimKar / row.birim_satis_tl) * 100 : 0;

    periodMap[row.donem].toplamKarMarji += karMarji;
    periodMap[row.donem].toplamMaliyet += row.birim_maliyet_tl;
    periodMap[row.donem].toplamSatisFiyati += row.birim_satis_tl;
    periodMap[row.donem].count += 1;
  });

  return Object.values(periodMap).map(p => ({
    donem: p.donem,
    ortalamaKarMarji: Number((p.toplamKarMarji / p.count).toFixed(2)),
    ortalamaMaliyet: Number((p.toplamMaliyet / p.count).toFixed(2)),
    ortalamaSatis: Number((p.toplamSatisFiyati / p.count).toFixed(2))
  })).sort((a, b) => a.donem.localeCompare(b.donem));
};

// Kategori Bazlı Stok Devir Hızı / Verimlilik Hesaplama
export const calculateCategoryTurnover = (data: ERPData[]) => {
  if (!data || data.length === 0) return [];

  const catMap: Record<string, { kategori: string; toplamSatis: number; toplamStok: number }> = {};

  data.forEach((row) => {
    if (!catMap[row.kategori]) {
      catMap[row.kategori] = { kategori: row.kategori, toplamSatis: 0, toplamStok: 0 };
    }
    catMap[row.kategori].toplamSatis += row.cikis_miktar;
    catMap[row.kategori].toplamStok += row.donem_sonu_stok;
  });

  return Object.values(catMap).map(item => ({
    kategori: item.kategori,
    devirHizi: item.toplamStok > 0 ? Number((item.toplamSatis / (item.toplamStok / 6)).toFixed(2)) : 0,
    toplamSatis: item.toplamSatis,
    toplamStok: item.toplamStok
  }));
};