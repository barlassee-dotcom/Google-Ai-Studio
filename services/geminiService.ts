
import { GoogleGenAI } from "@google/genai";
import { FlowPeriod, Asset } from "../types";

// Helper to initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCashFlow = async (periods: FlowPeriod[]) => {
  const ai = getAI();
  
  const summary = periods
    .filter(p => p.incomes > 0 || p.expenses > 0)
    .map(p => ({
      period: p.label,
      in: p.incomes.toFixed(0),
      out: p.expenses.toFixed(0),
      bal: p.balance.toFixed(0)
    })).slice(0, 30);

  const prompt = `
    Aşağıdaki Primus Coating nakit akışı projeksiyon verilerini analiz et:
    ${JSON.stringify(summary)}
    
    Lütfen şu başlıklarla Türkçe bir analiz yap:
    1. Nakit Akışı Özeti (Genel gidişat ve likidite durumu)
    2. Kritik Dönemler (Özellikle bakiyenin riskli seviyelere düştüğü tarihler)
    3. Primus Coating İçin Stratejik Tavsiyeler (Ödemeler ve tahsilat yönetimi için öneriler)
    
    Yanıtı profesyonel bir CFO tonunda, teknik ama anlaşılır maddeler halinde ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return { text: response.text || "Analiz üretilemedi." };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { text: "AI Analizi şu an yapılamıyor." };
  }
};

export const fetchMarketInsights = async () => {
  const ai = getAI();
  const prompt = "Türkiye güncel ekonomi verileri: TCMB yıl sonu enflasyon beklentisi, USD/TRY ve EUR/TRY kur beklentileri, sanayi üretimi ve kısa vadeli ekonomik görünüm özeti.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })).filter((s: any) => s.title && s.uri) || [];

    return {
      text: response.text || "Piyasa verileri şu an alınamıyor.",
      sources: sources
    };
  } catch (error) {
    console.error("Market Insights Error:", error);
    return { text: "Ekonomi gündemi yüklenirken bir hata oluştu.", sources: [] };
  }
};

export const chatWithAssistant = async (userMessage: string, context: { assets: Asset[], periods: FlowPeriod[] }) => {
  const ai = getAI();

  const assetSummary = context.assets
    .filter(a => a.included)
    .map(a => `${a.name} (${a.amount} ${a.currency})`)
    .join(", ");

  const systemPrompt = `
    Sen Primus Coating Cashflow finans asistanısın. 
    Kullanıcının mevcut varlıkları: ${assetSummary || "Tanımlı varlık yok."}.
    Gelecek 10 periyot bakiye tahmini: ${context.periods.slice(0, 10).map(p => p.label + ": " + p.balance.toFixed(0)).join(", ")}.
    
    Kullanıcının finansal sorularına Primus Coating kurumsal kimliğiyle yardımcı ol. Net, profesyonel ve verilere dayalı konuş.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt
      }
    });
    return response.text || "Üzgünüm, bu soruya şu an yanıt veremiyorum.";
  } catch (error) {
    return "Bağlantı hatası: AI asistanı şu an çevrimdışı.";
  }
};
