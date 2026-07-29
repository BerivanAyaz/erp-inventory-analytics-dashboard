# Sonart Tekstil - Çok Dönemli Satış ve Stok Yönetici Kokpiti (ERP)

## 📌 Özet
Bu uygulama, Sonart Tekstil’in Logo Netsis ERP verilerini işleyerek 6 aylık periyotlar ve dönemsel bazda kapsamlı bir satış, stok ve kârlılık analizi sunan akıllı bir karar destek kokpitidir. Ekran görüntülerinde ve videoda inceleyeceğiniz arayüz; ürün bazlı risk matrislerini, depo sevkiyat trendlerini ve ciro değişimlerini tek ekranda toplar. Ortaya çıkan sonuçlar, yönetim kuruluna hangi ürünlerin stok tükettiğini, hangi kategorilerin sermaye verimliliği sağladığını ve dönemsel bazda acil alınması gereken stratejik aksiyonları net bir şekilde söyler.

---

## 🔗 Ekran Kaydı & Tanıtım Videosu
* Uygulamanın baştan sona gezildiği, özelliklerinin ve çıktıların özetlendiği 1-2 dakikalık video: 

---

## 📸 Ekran Görüntüleri

### 1. Genel Kokpit ve Çok Dönemli KPI Görünümü
<img width="1883" height="708" alt="image" src="https://github.com/user-attachments/assets/9e991e72-4f8f-4cf5-b480-3ce8540d1fa4" />


### 2. Kâr Marjı, Stok Verimliliği ve Risk Matrisi Tablosu
<img width="1877" height="440" alt="image" src="https://github.com/user-attachments/assets/4d3a5e9f-d6b9-4c36-b6ab-bc7f589044b7" />

<img width="1883" height="473" alt="image" src="https://github.com/user-attachments/assets/bd5b97db-f55e-4a87-99df-4163c0f8ab31" />

---

### 2. Yapay Zeka Destekli Yönetici Strateji Özeti ve Eylem Planı
<img width="1886" height="857" alt="image" src="https://github.com/user-attachments/assets/10ac9700-7edf-462e-af68-8e15522305f7" />
<img width="1887" height="852" alt="image" src="https://github.com/user-attachments/assets/f8ef45f4-37e1-49b2-aa4f-eb66dacc485e" />
<img width="1888" height="847" alt="image" src="https://github.com/user-attachments/assets/50150780-4d50-44e0-a16c-b43e25cb4a51" />


## 🛠️ Seçilen Track, Stack ve AI Entegrasyonu

* **Seçilen Track:** Logo Netsis ERP verilerinin sunduğu kurumsal derinlik teknik açıdan çok daha cazip geldi; nitekim değerlendirme sürecimde de vurgulandığı üzere, işin çekirdeğindeki ERP ve tedarik zinciri analitiği çok daha kritik ve öncelikli bir katman oluşturuyordu.
* **Stack Seçimi:** Next.js (React), Tailwind CSS ve TypeScript. Hızlı component geliştirme kabiliyeti, güçlü tip güvenliği ve esnek state yönetimi sunduğu için seçilmiştir. Grafik bileşenlerinde Recharts, tablo ve veri düzenlemelerinde modern web standartları kullanılmıştır.
* **AI API Seçimi:** **Google Gemini API (Gemini 3.6 Flash)**. Büyük veri setlerini hızlı işleme kapasitesi, maliyet avantajı (free tier) ve Türkçe kurumsal raporlama diline kusursuz uyum sağladığı için tercih edilmiştir.

---

## 🔄 Dönemler Arası Farklılaşmanın Rapora Yansıtılması
Uygulama, CSV verisindeki dönem (`donem`) sütununu dinamik olarak parse ederek `availablePeriods` dizisini oluşturur. Kullanıcı arayüzdeki "Dönem Seçimi" dropdown menüsünden ister tek bir ayı (Örn: `2026-01`), ister "Tüm Dönemler (6 Ay Kümülatif)" seçeneğini seçebilir. Seçilen döneme göre:
* KPI kartları, zaman serisi grafikleri ve depo sevkiyat trendleri anlık olarak filtrelenir.
* Sayfanın altındaki Yapay Zeka Yönetici Strateji Özeti, seçilen dönemin verilerine özel olarak baştan hesaplanır ve o aya ait riskli ürünler/aksiyon önerileri dinamik olarak sunulur.

---

## 🧗‍♂️ En Zorlanılan Nokta ve Çözüm Yolu
* **Yaşanan Zorluk:** Çok dönemli ERP verilerinden gelen dinamik filtrelemelerin (tekil ay ile 6 aylık kümülatif ALL mod geçişleri) Recharts zaman serisi grafiklerinde ve kategori bazlı devir hızı hesaplamalarında anlık olarak senkronize edilmesi sırasında performans ve state tutarlılığı sorunu yaşandı.
* **Çözüm Yolu:** Veri işleme katmanı optimize edilerek filtreleme mekanizması applyFilters fonksiyonu altında merkezileştirildi; böylece dönem değişimlerinde tüm grafikler ve AI analiz istemcisi gereksiz render maliyeti olmaksızın anlık ve hatasız şekilde güncellendi.
---

## 🚀 Gerçek / Production Ortamına Taşısaydım Neyi Farklı Yapardım?
* **Ölçeklenebilirlik:** Veriler statik CSV yerine MSSQL / MongoDB tabanlı bir ERP veritabanından (`Prisma` veya `Drizzle` ORM ile) sunucu tarafında (Server-side Pagination) çekilirdi.
* **Güvenlik:** Kurumsal ERP verileri hassas olduğu için NextAuth / Auth.js ile rol tabanlı yetkilendirme (RBAC - C-Level Yönetici, Depo Sorumlusu vb.) eklenirdi.
* **Maliyet & Önbellekleme:** Mevcut yapıda tarayıcı tabanlı (localStorage) bireysel bir önbellek kullanıldığı için, her farklı kullanıcı aynı dönemi ilk açtığında API yeniden tetiklenir. Gerçek bir production ortamında ise sunucu tarafında Redis gibi merkezi bir caching mekanizması kurulur; böylece aynı döneme gelen ilk istekten sonra sonuçlar ortak havuzda saklanır ve tekrar eden API maliyetleri ile sunucu yükü sıfıra indirilir.

---

## 📦 Kurulum ve Çalıştırma Adımları

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. **Repoyu Klonlayın:**
   ```bash
   git clone <repo-url-adresiniz>
   cd sonart-dashboard
2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   cd sonart-dashboard
3. **Çevresel Değişkenleri (.env) Yapılandırın:**
   Proje kök dizininde .env.local adında bir dosya oluşturun ve kullanmak istediğiniz Gemini API anahtarınızı tanımlayın (Google AI Studio - Create API Key):
   GEMINI_API_KEY=senin_api_anahtarin_buraya
   > ⚠️ **Not:** Güvenlik nedeniyle `.env.local` dosyası repoda yer almamaktadır. Uygulamayı çalıştırabilmek için [Google AI Studio](https://aistudio.google.com/) üzerinden kendi ücretsiz Gemini API anahtarınızı almanız ve `.env.local` dosyasına tanımlamanız gerekmektedir.
5. **Geliştirmeyi Başlatın:**
   npm run dev
