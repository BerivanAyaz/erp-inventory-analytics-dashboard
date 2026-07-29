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
    const { trends, risks, kpis, selectedPeriod } = body;

    const periodContext = selectedPeriod === 'ALL' 
      ? "Genel 6 Aylık Kümülatif Trendler ve Dönemsel Kıyaslama" 
      : `Spesifik Dönem / Ay: ${selectedPeriod} (Bu aya ait operasyonel krizler ve daralmalar odak noktası olmalıdır)`;

    const prompt = `
      Sen "Sonart Tekstil" için çalışan Kıdemli Bir Veri Analisti ve Kurumsal Stratejistsin. 
      Aşağıda şirketimizin Logo Netsis ERP sisteminden alınan verileri filtrelenmiş durumdadır.

      ANALİZ BAĞLAMI: ${periodContext}

      VERİ SETİ ÖZETİ:
      - Seçilen Dönem KPI'ları: ${JSON.stringify(kpis)}
      - Zaman Serisi / Trendler: ${JSON.stringify(trends)}
      - Kritik Eşik Altındaki Riskli Ürünler: ${JSON.stringify(risks)}

      GÖREVİN:
      Yönetim kurulu (C-Level) için hazırlanacak bu raporda, yukarıdaki verileri derinlemesine analiz ederek somut, stratejik ve eyleme geçirilebilir bir içgörü raporu sun.

      RAPOR FORMATI VE KURALLAR:
      1. Sadece genel geçer ifadeler kullanma (örn: "satışları artırın" gibi klişelerden kaçın). Birim maliyetlerin seyrine, kâr marjı baskılarına ve stok devir hızına değin.
      2. Eğer belirli bir dönem seçildiyse (örn: 2026-04), o dönemin neden düştüğünü veya yükseldiğini (stok tükenmesi, maliyet sıçraması vb.) net bir şekilde açıkla.
      3. Riskli ürünler listesindeki spesifik ürün kodlarını (Örn: U003, U005, U014) ve isimlerini kullanarak acil operasyonel aksiyonlar (acil ikmal emri, emniyet stoku güncellemesi vb.) öner.
      4. Çıktıyı kesinlikle Markdown etiketleri (\`\`\`html vb.) KULLANMADAN, doğrudan saf HTML formatında (<strong>, <br>, <ul>, <li>) ver. Profesyonel, analitik ve net bir iş dili kullan.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
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