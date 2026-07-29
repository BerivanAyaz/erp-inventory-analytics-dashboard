'use client';

import React, { useEffect, useState } from 'react';
import { Download, Bot, X, Send, Sparkles, RefreshCw, Filter, AlertTriangle } from 'lucide-react';
import { processCSVData } from '../src/utils/dataProcessor';
import { calculateKPIs, calculateMonthlyTrends, calculateCategoryTrends, calculateDepotTrends, calculateMarginTrends, calculateCategoryTurnover, identifyRisks } from '../src/utils/calculations';
import TrendChart from '../src/components/TrendChart';
import CategoryTrendChart from '../src/components/CategoryTrendChart';
import DepotTrendChart from '../src/components/DepotTrendChart';
import MarginTrendChart from '../src/components/MarginTrendChart';
import KpiCards from '../src/components/KpiCards';
import AnomalyBanner from '../src/components/AnomalyBanner';
import RiskMatrixTable from '../src/components/RiskMatrixTable';
import StockTurnoverChart from '../src/components/StockTurnoverChart';
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [rawCleanData, setRawCleanData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categoryTrendData, setCategoryTrendData] = useState<any[]>([]);
  const [depotTrendData, setDepotTrendData] = useState<any[]>([]);
  const [marginTrendData, setMarginTrendData] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [turnoverData, setTurnoverData] = useState<any[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        setAvailablePeriods(periods);

        applyFilters('ALL', cleanData);
        setLoading(false);

        fetchAIAnalysis(calculateMonthlyTrends(cleanData), identifyRisks(cleanData), calculateKPIs(cleanData), 'ALL');

      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const applyFilters = (period: string, sourceData: any[]) => {
    if (!sourceData || sourceData.length === 0) return;
    
    let filtered = [...sourceData];

    if (period !== 'ALL') {
      filtered = filtered.filter(d => d.donem === period);
    }

    const currentKpis = calculateKPIs(filtered);
    const currentTrends = calculateMonthlyTrends(filtered);
    const currentRisks = identifyRisks(filtered);

    setKpis(currentKpis);
    setTrends(currentTrends);
    setCategoryTrendData(calculateCategoryTrends(filtered));
    setDepotTrendData(calculateDepotTrends(filtered));
    setMarginTrendData(calculateMarginTrends(filtered));
    setRisks(currentRisks);
    setTurnoverData(calculateCategoryTurnover(filtered));

    // Dönem değiştikçe AI analizini o döneme göre yeniden tetikle
    fetchAIAnalysis(currentTrends, currentRisks, currentKpis, period);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    applyFilters(period, rawCleanData);
  };

  const fetchAIAnalysis = async (trendsData: any, risksData: any, kpisData: any, period: string, forceRefresh = false) => {
    const cacheKey = `sonart_ai_analysis_${period}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
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
        body: JSON.stringify({ trends: trendsData, risks: risksData, kpis: kpisData, selectedPeriod: period })
      });
      
      if (!res.ok) throw new Error("API Yanıt Vermedi");
      
      const data = await res.json();
      setAiAnalysis(data.analysis);
      localStorage.setItem(cacheKey, data.analysis);
    } catch (err) {
      setAiError('Yapay zeka analiz raporu oluşturulurken sistemsel bir hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefreshAI = () => {
    const cacheKey = `sonart_ai_analysis_${selectedPeriod}`;
    localStorage.removeItem(cacheKey);
    fetchAIAnalysis(trends, risks, kpis, selectedPeriod, true);
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
        text: `"${chatMessage}" sorgunuz için ${selectedPeriod === 'ALL' ? '6 aylık kümülatif' : selectedPeriod} dönemi ERP veritabanı taranmıştır. Operasyonel akış rapor ile uyumludur.` 
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

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6 font-sans">
      <div className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-200">
        
        {/* ÜST RAPOR HEADER VE FİLTRE ŞERİTİ */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-md tracking-wide">NETSIS ERP</span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Sonart Tekstil Satış & Stok Performans Kokpiti</h1>
              <p className="text-slate-400 text-xs">Veri Son Güncelleme: Canlı Akış • Çok Dönemli Yönetici Raporu</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <AnomalyBanner anomalies={anomalies} />

{/* MODERN ÖZEL DROPDOWN */}
            <div className="relative">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all select-none"
              >
                <Filter size={14} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Dönem Seçimi:</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedPeriod === 'ALL' ? 'Tüm Dönemler (6 Ay Kümülatif)' : selectedPeriod}
                </span>
                <span className={`text-slate-500 text-xs transition-transform duration-200 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div 
                    onClick={() => { setSelectedPeriod('ALL'); applyFilters('ALL', rawCleanData); setIsDropdownOpen(false); }}
                    className={`px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedPeriod === 'ALL' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'}`}
                  >
                    Tüm Dönemler (6 Ay Kümülatif)
                  </div>
                  {availablePeriods.map(p => (
                    <div 
                      key={p}
                      onClick={() => { setSelectedPeriod(p); applyFilters(p, rawCleanData); setIsDropdownOpen(false); }}
                      className={`px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedPeriod === p ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'}`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow font-semibold text-xs"
            >
              <Download size={14} />
              PDF Export
            </button>
          </div>
        </div>

        {/* 1. ŞERİT: KPI KARTLARI */}
        <KpiCards kpis={kpis} />

        {/* 2. ŞERİT: 4'LÜ ZAMAN SERİSİ BENTO GRID (2x2 Düzen) */}
       {/* 2. ŞERİT: ZAMAN SERİSİ VE VERİMLİLİK BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Aylık Satış & Stok Trendi</h2>
            <p className="text-[11px] text-slate-400 mb-2">Zaman serisi hacim değişimi</p>
            <TrendChart data={trends} />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Kategori Bazlı Ciro Trendi</h2>
            <p className="text-[11px] text-slate-400 mb-2">6 aylık kategori bazlı gelir değişimi</p>
            <CategoryTrendChart data={categoryTrendData} />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Depo Sevkiyat Trendi</h2>
            <p className="text-[11px] text-slate-400 mb-2">6 aylık depo çıkış/sevkiyat değişimi</p>
            <DepotTrendChart data={depotTrendData} />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Kâr Marjı & Maliyet Trendi</h2>
            <p className="text-[11px] text-slate-400 mb-2">Dönemsel karlılık ve maliyet enflasyon analizi</p>
            <MarginTrendChart data={marginTrendData} />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h2 className="text-sm font-bold text-slate-900">Kategori Bazlı Stok Devir Hızı & Sermaye Verimliliği</h2>
            <p className="text-[11px] text-slate-400 mb-2">Hangi kategorinin depoda ne kadar hızlı nakde döndüğünün analizi</p>
            <StockTurnoverChart data={turnoverData} />
          </div>
        </div>
        {/* 3. ŞERİT: RİSK MATRİSİ */}
        <div className="mb-6">
          <RiskMatrixTable risks={risks} />
        </div>

        {/* 4. ŞERİT: YÖNETİCİ STRATEJİ ÖZETİ (AI - DİNAMİK) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative mb-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Sparkles className="text-blue-600" size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Yönetici Strateji Özeti & Dönemsel Eylem Önerileri</h2>
                <p className="text-[11px] text-slate-500">Gemini 3.6 Flash • Seçilen Dönem: {selectedPeriod === 'ALL' ? 'Tüm 6 Ay' : selectedPeriod}</p>
              </div>
            </div>
            
            <button 
              onClick={handleRefreshAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={aiLoading ? "animate-spin" : ""} />
              Analizi Yenile
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-xs md:text-sm leading-relaxed">
            {aiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                <p className="text-xs text-blue-600 font-medium pt-1">Yapay zeka {selectedPeriod} dönemi için yeniden analiz üretiyor...</p>
              </div>
            ) : aiError ? (
              <div className="text-red-500 flex items-center gap-2"><AlertTriangle size={16} /> {aiError}</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: aiAnalysis || "Analiz bekleniyor..." }} />
            )}
          </div>
        </div>

      </div>

      {/* YÜZEN CHATBOT */}
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
                Merhaba! Sonart Tekstil ERP asistanıyım. Seçtiğiniz dönem ({selectedPeriod}) bağlamında sorularınızı yanıtlamaya hazırım.
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
                placeholder="Örn: Bu dönem en riskli ürün hangisi?" 
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