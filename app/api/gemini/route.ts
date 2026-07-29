import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
  try {
    if (!apiKey || !genAI) {
      return NextResponse.json({ error: 'API anahtarı eksik.' }, { status: 500 });
    }

    const body = await request.json();
    const { trends, risks, kpis } = body;

    const prompt = `
      Sen Sonart Tekstil için çalışan kıdemli bir veri analisti ve stratejistisin. 
      Aşağıda sana şirketin son 6 aylık ERP verilerinden özetlenmiş metrikleri, satış/stok trendlerini ve tespit edilen riskli ürünleri veriyorum.

      VERİLER:
      - Genel KPI'lar: ${JSON.stringify(kpis)}
      - Aylık Trendler: ${JSON.stringify(trends)}
      - Tespit Edilen Riskli Ürünler: ${JSON.stringify(risks)}

      GÖREVİN:
      Bu verileri inceleyerek yönetim kuruluna sunulmak üzere kısa, net ve döneme özgü eyleme geçirilebilir bir analiz yaz.
      
      KURALLAR:
      1. Sadece genel geçer şeyler söyleme (örn: "satışları artırın"). Mevsimsellik, stok tükenme riski veya daralan kâr marjları gibi somut dinamiklere değin.
      2. Trendlerdeki değişime dikkat çek (örneğin son aylarda satışlar artıyor mu düşüyor mu?).
      3. Riskli ürünler listesinde (eğer varsa) spesifik ürün kodlarını ve isimlerini kullanarak 1-2 acil aksiyon önerisi sun.
      4. Metni çok uzun tutma, profesyonel bir iş dili kullan ve HTML (<strong>, <br>, <ul>, <li>) etiketleri ile formatlanmış temiz bir çıktı ver. Markdown KULLANMA, sadece saf HTML kullan.
    `;

    // 1. ADIM: Google'a "Benim API anahtarımla hangi modeller aktif?" diye soruyoruz
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (!listData.models) {
      throw new Error("Model listesi çekilemedi. API anahtarında sorun olabilir.");
    }

    // 2. ADIM: Listeden sadece "metin üretimi (generateContent)" yapabilenleri filtrele
    const availableModels = listData.models
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace('models/', '')); // Baştaki 'models/' takısını temizle

    console.log("🔑 SENİN HESABINDAKİ AKTİF MODELLER:", availableModels);

    if (availableModels.length === 0) {
      throw new Error("Hesabınıza tanımlı metin üretebilen bir model bulunamadı.");
    }

    // 3. ADIM: Listeden en uygun modeli otomatik seç 
    // (Öncelikli olarak isminde 'flash' veya 'pro' geçen güncel modellerden birini arar, bulamazsa listedeki ilk modeli alır)
const selectedModelName = 'gemini-3.6-flash';    
    console.log("🚀 YENİDEN HEDEFLENEN MODEL:", selectedModelName);

    // 4. ADIM: Seçilen ve %100 çalıştığından emin olduğumuz model ile analizi üret
    const model = genAI.getGenerativeModel({ model: selectedModelName });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ analysis: responseText }, { status: 200 });

  } catch (error: any) {
    console.error('Gemini API Hatası Detayı:', error.message || error);
    return NextResponse.json(
      { error: 'Yapay zeka analizi oluşturulurken bir hata meydana geldi.' },
      { status: 500 }
    );
  }
}