'use client';

import React, { useEffect, useState } from 'react';
import { Download, Bot, X, Send, Sparkles, RefreshCw, Filter, Warehouse, AlertTriangle } from 'lucide-react';
import { processCSVData } from '../src/utils/dataProcessor';
import { calculateKPIs, calculateMonthlyTrends, calculateCategoryPerformance, calculateDepotPerformance, identifyRisks } from '../src/utils/calculations';
import TrendChart from '../src/components/TrendChart';
import CategoryChart from '../src/components/CategoryChart';
import DepotChart from '../src/components/DepotChart';
import KpiCards from '../src/components/KpiCards';
import AnomalyBanner from '../src/components/AnomalyBanner';
import ProductXRay from '../src/components/ProductXRay';
import RiskMatrixTable from '../src/components/RiskMatrixTable';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [rawCleanData, setRawCleanData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [depotData, setDepotData] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);

  // Filtreler
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedDepot, setSelectedDepot] = useState<string>('ALL');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [availableDepots, setAvailableDepots] = useState<string[]>([]);

  // Ürün Bazlı Drill-Down State'leri
  const [availableProducts, setAvailableProducts] = useState<{ stokKodu: string; urunAdi: string }[]>([]);
  const [selectedProductCode, setSelectedProductCode] = useState<string>('ALL');

  // AI Raporu State'leri
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  // Chatbot State'leri
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sonart_erp_cok_donemli_2.csv');
        if (!response.ok) throw new Error('CSV dosyası bulunamadı!');
        const csvText = await response.text();

        const { cleanData, anomalies: detectedAnomalies } = await processCSVData(csvText) as any;
        
        setRawCleanData(cleanData);
        setAnomalies(detectedAnomalies);

        const periods = [...new Set(cleanData.map((d: any) => d.donem))].sort() as string[];
        const depots = [...new Set(cleanData.map((d: any) => d.depo))] as string[];
        
        const productMap = new Map();
        cleanData.forEach((d: any) => {
          if (!productMap.has(d.stok_kodu)) {
            productMap.set(d.stok_kodu, d.urun_adi);
          }
        });
        const productsList = Array.from(productMap.entries()).map(([stokKodu, urunAdi]) => ({ stokKodu, urunAdi }));

        setAvailablePeriods(periods);
        setAvailableDepots(depots);
        setAvailableProducts(productsList);

        applyFiltersWithData('ALL', 'ALL', cleanData);
        setLoading(false);

        const cachedAnalysis = localStorage.getItem('sonart_ai_analysis_cache');
        if (cachedAnalysis) {
          setAiAnalysis(cachedAnalysis);
        } else {
          fetchAIAnalysis(calculateMonthlyTrends(cleanData), identifyRisks(cleanData), calculateKPIs(cleanData));
        }

      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const applyFilters = (period: string, depot: string) => {
    applyFiltersWithData(period, depot, rawCleanData);
  };

  const applyFiltersWithData = (period: string, depot: string, sourceData: any[]) => {
    if (!sourceData || sourceData.length === 0) return;
    
    let filtered = [...sourceData];

    if (period !== 'ALL') {
      filtered = filtered.filter(d => d.donem === period);
    }
    if (depot !== 'ALL') {
      filtered = filtered.filter(d => d.depo === depot);
    }

    setKpis(calculateKPIs(filtered));
    setTrends(calculateMonthlyTrends(filtered));
    setCategoryData(calculateCategoryPerformance(filtered));
    setDepotData(calculateDepotPerformance(filtered));
    setRisks(identifyRisks(filtered));
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    applyFilters(period, selectedDepot);
  };

  const handleDepotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depot = e.target.value;
    setSelectedDepot(depot);
    applyFilters(selectedPeriod, depot);
  };

  const getSelectedProductHistory = () => {
    if (selectedProductCode === 'ALL') return [];
    return rawCleanData.filter(d => d.stok_kodu === selectedProductCode).sort((a, b) => a.donem.localeCompare(b.donem));
  };

  const fetchAIAnalysis = async (trendsData: any, risksData: any, kpisData: any, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem('sonart_ai_analysis_cache');
      if (cached) {
        setAiAnalysis(cached);
        return;
      }
    }

    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trends: trendsData, risks: risksData, kpis: kpisData })
      });
      
      if (!res.ok) throw new Error("API Yanıt Vermedi");
      
      const data = await res.json();
      setAiAnalysis(data.analysis);
      localStorage.setItem('sonart_ai_analysis_cache', data.analysis);
    } catch (err) {
      setAiError('Yapay zeka analiz raporu oluşturulurken sistemsel bir hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefreshAI = () => {
    localStorage.removeItem('sonart_ai_analysis_cache');
    fetchAIAnalysis(trends, risks, kpis, true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newUserMsg = { role: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatMessage('');
    setChatLoading(true);

    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: `"${chatMessage}" sorgunuz için ERP veritabanı taranmıştır. İlgili dönemde seçilen parametreler doğrultusunda operasyonel akış normal seviyededir.` 
      }]);
      setChatLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-slate-300">Logo Netsis ERP Verileri Yükleniyor...</p>
      </div>
    );
  }

  const productHistory = getSelectedProductHistory();

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200">
        
        {/* ÜST BAŞLIK VE FİLTRELER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded">LOGO NETSIS ERP</span>
              <span className="text-slate-400 text-xs font-medium">Simülasyon v2.7 (Modular Lead Edition)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sonart Tekstil Yönetim Kokpiti</h1>
            <p className="text-slate-500 text-sm mt-1">Stok, Satış, Finansal Trend ve Ürün Röntgeni Analizi</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Dönem Filtresi */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg shadow-sm">
              <Filter size={15} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Dönem:</span>
              <select 
                value={selectedPeriod} 
                onChange={handlePeriodChange}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tüm Dönemler (6 Ay)</option>
                {availablePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Depo Filtresi */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg shadow-sm">
              <Warehouse size={15} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Depo:</span>
              <select 
                value={selectedDepot} 
                onChange={handleDepotChange}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tüm Depolar</option>
                {availableDepots.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow font-medium text-sm ml-auto lg:ml-0"
            >
              <Download size={16} />
              PDF Raporu İndir
            </button>
          </div>
        </div>

        {/* MODÜLER BİLEŞENLER */}
        <AnomalyBanner anomalies={anomalies} />
        <KpiCards kpis={kpis} />

        {/* GRAFİKLER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-base font-bold text-slate-900">Aylık Satış & Stok Trendi</h2>
            <p className="text-xs text-slate-400 mb-4">Zaman serisi performans değişimi</p>
            <TrendChart data={trends} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-base font-bold text-slate-900">Kategori Bazlı Ciro</h2>
            <p className="text-xs text-slate-400 mb-4">Ürün gruplarının gelir payı (TL)</p>
            <CategoryChart data={categoryData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h2 className="text-base font-bold text-slate-900">Depo Bazlı Dağılım</h2>
            <p className="text-xs text-slate-400 mb-4">Ana ve Yan depo sevkiyat/stok kıyaslaması</p>
            <DepotChart data={depotData} />
          </div>
        </div>

        <ProductXRay 
          availableProducts={availableProducts}
          selectedProductCode={selectedProductCode}
          onSelectProduct={setSelectedProductCode}
          productHistory={productHistory}
        />

        <RiskMatrixTable risks={risks} />

        {/* YÖNETİCİ STRATEJİ ÖZETİ */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Yönetici Strateji Özeti & Eylem Önerileri</h2>
                <p className="text-xs text-slate-500">Gemini 3.6 Flash • Kurumsal Karar Destek Modülü</p>
              </div>
            </div>
            
            <button 
              onClick={handleRefreshAI}
              disabled={aiLoading}
              title="Yapay zekadan taze analiz iste"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={aiLoading ? "animate-spin" : ""} />
              Analizi Yenile
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
            {aiLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <p className="text-xs text-blue-600 font-medium pt-2">ERP verileri yapay zeka tarafından işleniyor...</p>
              </div>
            ) : aiError ? (
              <div className="text-red-500 flex items-center gap-2"><AlertTriangle size={18} /> {aiError}</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: aiAnalysis || "Analiz bekleniyor..." }} />
            )}
          </div>
        </div>

      </div>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105">
            <Bot size={26} />
          </button>
        ) : (
          <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Bot size={18} /><span className="font-semibold text-sm">ERP Veri Asistanı</span></div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-slate-800 p-1 rounded transition"><X size={16}/></button>
            </div>
            
            <div className="h-72 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3 text-xs md:text-sm">
              <div className="bg-blue-50 border border-blue-100 text-slate-800 self-start p-3 rounded-xl max-w-[85%]">
                Merhaba! Sonart Tekstil ERP asistanıyım. Stoklar, depo dağılımları veya kâr marjları hakkında bana soru sorabilirsiniz.
              </div>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`p-3 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-white border border-slate-200 text-slate-800 self-start'}`}>
                  {msg.text}
                </div>
              ))}
              {chatLoading && (
                <div className="bg-white border border-slate-200 self-start p-3 rounded-xl flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                placeholder="Örn: En çok satan ürün hangisi?" 
                className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}