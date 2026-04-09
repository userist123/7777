import React, { useState, useRef } from "react";
import axios from "axios";
import { Image, Upload, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalizaGrafic({ api }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format invalid. Folositi JPEG, PNG sau WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Fisierul este prea mare. Maximum 10MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      const base64 = e.target.result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64("");
    setAnalysis("");
    setError("");
  };

  const analyze = async () => {
    if (!imageBase64) {
      setError("Incarcati o imagine mai intai.");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");
    try {
      const res = await axios.post(`${api}/analyze-chart`, {
        image_base64: imageBase64,
        prompt: prompt,
      });
      setAnalysis(res.data.analysis);
    } catch (e) {
      setError(e.response?.data?.detail || "Eroare la analiza. Incercati din nou.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-trade-accent mt-3 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-trade-text-primary mt-4 mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-trade-text-primary mt-4 mb-2">{line.replace('# ', '')}</h1>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-trade-text-primary text-xs mt-2">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-xs text-trade-text-secondary ml-4 list-disc">{line.replace(/^[-*]\s/, '')}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="text-xs text-trade-text-secondary ml-4 list-decimal">{line.replace(/^\d+\.\s?/, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-xs text-trade-text-secondary leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
    });
  };

  return (
    <div className="space-y-4" data-testid="analiza-grafic-page">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-trade-accent" />
        <h2 className="text-base font-heading font-bold text-trade-text-primary">Analiza Grafic cu AI</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {!imagePreview ? (
            <div
              data-testid="upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-trade-border rounded-lg p-8 text-center cursor-pointer hover:border-trade-accent/50 transition-colors bg-[#161923]"
            >
              <Upload className="w-8 h-8 text-trade-text-secondary mx-auto mb-3" />
              <p className="text-sm text-trade-text-secondary">
                Drag & drop sau click pentru a incarca
              </p>
              <p className="text-xs text-trade-text-secondary/60 mt-1">
                JPEG, PNG, WEBP - max 10MB
              </p>
              <p className="text-xs text-trade-accent mt-2">
                Screenshot din TradingView, MetaTrader sau orice grafic cu candele
              </p>
              <input ref={fileRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files[0])} data-testid="file-input" />
            </div>
          ) : (
            <div className="relative bg-[#161923] border border-trade-border rounded-lg overflow-hidden">
              <button onClick={clearImage} data-testid="clear-image-btn"
                className="absolute top-2 right-2 z-10 p-1 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
              <img src={imagePreview} alt="Chart" className="w-full max-h-80 object-contain" data-testid="chart-preview" />
            </div>
          )}

          <textarea
            data-testid="analysis-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: adaugati context (ex: 'Analizeaza pattern-ul head and shoulders', 'Ce suport/rezistenta vezi?', 'E un moment bun de intrare?')"
            className="w-full bg-[#161923] border border-trade-border rounded-lg px-3 py-2 text-xs text-trade-text-primary placeholder:text-trade-text-secondary/40 focus:outline-none focus:border-trade-accent resize-none h-20"
          />

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</div>}

          <Button data-testid="analyze-btn" onClick={analyze} disabled={loading || !imageBase64}
            className="w-full bg-trade-accent hover:bg-trade-accent/90 text-white h-10">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se analizeaza graficul...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Analizeaza Graficul</>
            )}
          </Button>
        </div>

        <div className="bg-[#161923] border border-trade-border rounded-lg p-4 min-h-[300px]" data-testid="analysis-result">
          <h3 className="text-sm font-heading font-bold text-trade-text-primary mb-3">Rezultat Analiza</h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-trade-accent animate-spin" />
              <p className="text-xs text-trade-text-secondary">AI analizeaza graficul...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm max-w-none">{renderMarkdown(analysis)}</div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-trade-text-secondary">
              <Image className="w-12 h-12 opacity-20" />
              <p className="text-sm">Incarcati un grafic pentru a primi analiza AI</p>
              <p className="text-xs opacity-60">Suporta: TradingView, MetaTrader, Binance, si alte platforme</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
