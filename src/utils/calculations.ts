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

// Depo performans analizi (Yeni)
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
    
    let riskTuru = "";
    let riskSeviyesi = "Düşük";

    let daralanMarjMi = false;
    if (oncekiDonem) {
      const oncekiUrun = oncekiDonemVerileri.find(u => u.stok_kodu === row.stok_kodu);
      if (oncekiUrun) {
        const oncekiSatisFiyati = oncekiUrun.birim_satis_tl > 0 ? oncekiUrun.birim_satis_tl : 1;
        const oncekiKarMarji = ((oncekiSatisFiyati - oncekiUrun.birim_maliyet_tl) / oncekiSatisFiyati) * 100;
        if ((oncekiKarMarji - mevcutKarMarji) > 5) {
          daralanMarjMi = true;
        }
      }
    }

    if (row.donem_sonu_stok === 0) {
      riskTuru = "Kritik: Stok Tamamen Tükenti!";
      riskSeviyesi = "Kritik";
    } else if (row.donem_sonu_stok > 0 && row.donem_sonu_stok < 20) {
      riskTuru = "Stok Tükenme Riski";
      riskSeviyesi = "Kritik";
    } else if (row.cikis_miktar < 10 && row.donem_sonu_stok > 200) {
      riskTuru = "Yavaş Hareket Eden (Elde Kalan)";
      riskSeviyesi = "Uyarı";
    } else if (daralanMarjMi) {
      riskTuru = "Daralan Kâr Marjı (Düşüş Trendi)";
      riskSeviyesi = "Uyarı";
    } else if (mevcutKarMarji < 10) {
      riskTuru = "Çok Düşük Kâr Marjı";
      riskSeviyesi = "Uyarı";
    }

    if (riskTuru !== "") {
      riskliUrunler.push({
        stokKodu: row.stok_kodu,
        urunAdi: row.urun_adi,
        riskTuru,
        riskSeviyesi,
        karMarji: mevcutKarMarji.toFixed(1),
        stok: row.donem_sonu_stok
      });
    }
  });

  // Stoğu 0 olanlar en üste gelecek şekilde sıralama (Senior dokunuşu)
  return riskliUrunler.sort((a, b) => a.stok - b.stok);
};
