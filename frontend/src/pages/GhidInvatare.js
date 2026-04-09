import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    title: "RSI (Relative Strength Index)",
    content: [
      { subtitle: "Ce este?", text: "Indicator de momentum care masoara viteza si magnitudinea schimbarilor de pret. Scala: 0-100." },
      { subtitle: "Interpretare", text: "Sub 30 = Supravandut (potential semnal BUY)\nPeste 70 = Supracumparat (potential semnal SELL)\n30-70 = Zona neutra" },
      { subtitle: "Strategii", text: "1. Divergenta RSI vs Pret = semnal puternic de inversare\n2. RSI sub 30 + MACD bullish cross = semnal BUY puternic\n3. RSI peste 70 + volum in scadere = semnal SELL\n4. RSI 50 = nivel pivot - trenduri puternice il respecta" },
      { subtitle: "Setari recomandate", text: "Perioada: 14 (standard)\nPentru scalping: 7-9\nPentru swing: 14-21" },
    ],
  },
  {
    title: "MACD (Moving Average Convergence Divergence)",
    content: [
      { subtitle: "Ce este?", text: "Indicator de trend-following care arata relatia dintre doua medii mobile exponentiale (EMA12 si EMA26)." },
      { subtitle: "Componente", text: "MACD Line = EMA(12) - EMA(26)\nSignal Line = EMA(9) al MACD Line\nHistogram = MACD Line - Signal Line" },
      { subtitle: "Semnale", text: "1. MACD cross peste Signal = BUY\n2. MACD cross sub Signal = SELL\n3. Histogram pozitiv crescator = momentum bullish crescator\n4. Histogram negativ scazator = momentum bearish crescator\n5. Divergenta MACD vs Pret = inversare iminenta" },
      { subtitle: "Sfaturi", text: "Nu folositi MACD izolat - combinati cu RSI si volume\nHistogramul este cel mai sensibil indicator al momentumului\nCrossover-urile in zona 0 sunt cele mai puternice" },
    ],
  },
  {
    title: "Medii Mobile (MA20, MA50, MA200)",
    content: [
      { subtitle: "Ce sunt?", text: "Mediile de preturi pe diferite perioade care netezesc zgomotul pietei si arata directia trendului." },
      { subtitle: "Tipuri", text: "SMA (Simple) = media aritmetica a preturilor\nEMA (Exponential) = acorda greutate mai mare preturilor recente\nMA20 = trend pe termen scurt\nMA50 = trend pe termen mediu\nMA200 = trend pe termen lung" },
      { subtitle: "Semnale importante", text: "Golden Cross: MA50 trece PESTE MA200 = semnal BUY major\nDeath Cross: MA50 trece SUB MA200 = semnal SELL major\nPret peste MA200 = piata bullish pe termen lung\nPret sub MA200 = piata bearish pe termen lung" },
      { subtitle: "Utilizare practica", text: "MA20 ca suport/rezistenta dinamic pe termen scurt\nMA50 pentru confirmarea trendului mediu\nMA200 ca 'linia de demarcatie' bull vs bear market" },
    ],
  },
  {
    title: "Bollinger Bands",
    content: [
      { subtitle: "Ce sunt?", text: "Benzi de volatilitate in jurul unei medii mobile. Banda superioara si inferioara sunt la 2 deviatii standard de MA20." },
      { subtitle: "Interpretare", text: "Pretul la banda superioara = potential supracumparat\nPretul la banda inferioara = potential supravandut\nBanzi inguste (squeeze) = volatilitate scazuta, miscare mare iminenta\nBanzi largi = volatilitate ridicata" },
      { subtitle: "Strategii", text: "1. Bollinger Squeeze: cand benzile se ingusteaza, pregatiti-va pentru breakout\n2. Walk the Band: in trend puternic, pretul poate 'merge' pe banda\n3. Reversion to Mean: pretul tinde sa revina la MA20 (media)" },
    ],
  },
  {
    title: "ATR (Average True Range)",
    content: [
      { subtitle: "Ce este?", text: "Masoara volatilitatea medie a unui activ pe o perioada data (standard 14 zile). NU indica directia, doar magnitudinea miscarii." },
      { subtitle: "Utilizare", text: "Stop Loss = Entry - 1.5 x ATR (pentru BUY)\nTake Profit = Entry + 3.0 x ATR (pentru BUY)\nRisk/Reward = 1:2 (standard cu formula de mai sus)" },
      { subtitle: "Interpretare ATR", text: "ATR in crestere = volatilitate crescuta, miscari mai mari\nATR in scadere = piata se consolideaza\nATR ridicat = stop loss-uri mai largi necesare\nATR scazut = stop loss-uri mai stranse posibile" },
    ],
  },
  {
    title: "Stochastic Oscillator",
    content: [
      { subtitle: "Ce este?", text: "Compara pretul de inchidere cu range-ul de preturi pe o perioada data. %K = linia rapida, %D = linia lenta (SMA 3 al %K)." },
      { subtitle: "Semnale", text: "Sub 20 = Supravandut (BUY potential)\nPeste 80 = Supracumparat (SELL potential)\n%K cross peste %D in zona 20 = BUY\n%K cross sub %D in zona 80 = SELL" },
      { subtitle: "Sfaturi", text: "Combinati cu RSI pentru confirmare dubla\nIn trend puternic, poate ramane mult timp in zona extrema\nDivergentele Stochastic vs Pret sunt semnale puternice" },
    ],
  },
  {
    title: "Volumul si RVOL",
    content: [
      { subtitle: "Volumul", text: "Numarul de unitati tranzactionate intr-o perioada. Confirma puterea miscarii de pret." },
      { subtitle: "RVOL (Relative Volume)", text: "RVOL = Volum Curent / Volum Mediu 20 zile\nRVOL > 1.5 = Volum semnificativ peste medie\nRVOL < 0.6 = Volum foarte scazut\nRVOL > 2.0 = Eveniment major, miscare importanta" },
      { subtitle: "Reguli", text: "1. Breakout + volum mare = miscare valida\n2. Breakout + volum mic = false breakout probabil\n3. Trend + volum crescator = trend sanatos\n4. Trend + volum scazator = trend slabit, inversare posibila" },
    ],
  },
  {
    title: "Sistemul de Semnale (Score)",
    content: [
      { subtitle: "Cum functioneaza?", text: "Fiecare activ primeste un scor bazat pe confluenta mai multor indicatori. Score >= 3 = BUY, Score <= -3 = SELL, altfel WAIT." },
      { subtitle: "Componente Score", text: "RSI: +2 (sub 35), +1 (sub 45), -1 (peste 65), -2 (peste 75)\nMACD: +2 (impuls pozitiv nou), +1 (pozitiv activ), -1 (negativ activ), -2 (negativ nou)\nMA Cross: +2 (Golden Cross), -2 (Death Cross)\nRVOL: +1 (peste 1.5), -1 (sub 0.6)" },
      { subtitle: "Interpretare", text: "Score 5-6 = Semnal foarte puternic\nScore 3-4 = Semnal bun, confirmat\nScore 1-2 = Inclinatie usoara\nScore 0 = Neutral complet\nScore negativ = inverseaza interpretarea" },
    ],
  },
  {
    title: "Managementul Riscului",
    content: [
      { subtitle: "Regula 1%", text: "Nu riscati mai mult de 1-2% din capital pe o singura tranzactie. Ex: Capital 10,000$ -> Risc max per trade = 100-200$" },
      { subtitle: "Risk/Reward", text: "Minimum R/R de 1:2 recomandat\nR/R 1:3 sau mai mare = excelent\nNu intrati in tranzactii cu R/R sub 1:1.5" },
      { subtitle: "Position Sizing", text: "Lot Size = (Capital x %Risc) / (Entry - StopLoss)\nEx: 10,000$ x 1% / 50 pips = 0.2 loturi" },
      { subtitle: "Reguli de aur", text: "1. Setati INTOTDEAUNA Stop Loss\n2. Nu mutati SL in directia pierderii\n3. Folositi trailing stop in profit\n4. Diversificati - max 3-5 pozitii deschise simultan\n5. Nu tradati in zilele de stiri majore fara experienta" },
    ],
  },
  {
    title: "Psihologia Trading-ului",
    content: [
      { subtitle: "Emotii principale", text: "FOMO (Fear of Missing Out) = Nu intrati in pozitii din graba\nFrică = Nu inchideti pozitii profitabile prea devreme\nLacomie = Nu lasati pozitiile sa se intoarca impotriva voastra\nRevansa = Nu incercati sa recuperati pierderile imediat" },
      { subtitle: "Disciplina", text: "1. Urmati planul de trading - nu deviatii emotionale\n2. Jurnalizati fiecare tranzactie\n3. Analizati saptamanal performanta\n4. Acceptati pierderile ca parte din proces\n5. Luati pauze dupa serii de pierderi (min 24h)" },
    ],
  },
];

const AccordionItem = ({ section, isOpen, onToggle }) => (
  <div className="bg-[#161923] border border-trade-border rounded-lg overflow-hidden">
    <button onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      data-testid={`ghid-section-${section.title.split(' ')[0]}`}>
      <span className="text-sm font-heading font-bold text-trade-text-primary">{section.title}</span>
      {isOpen ? <ChevronDown className="w-4 h-4 text-trade-text-secondary" /> : <ChevronRight className="w-4 h-4 text-trade-text-secondary" />}
    </button>
    {isOpen && (
      <div className="px-4 pb-4 space-y-3 border-t border-trade-border/50">
        {section.content.map(item => (
          <div key={item.subtitle} className="mt-3">
            <h4 className="text-xs font-bold text-trade-accent mb-1">{item.subtitle}</h4>
            <p className="text-xs text-trade-text-secondary whitespace-pre-line leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function GhidInvatare() {
  const [openSections, setOpenSections] = useState(new Set([0]));

  const toggle = (idx) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-3" data-testid="ghid-invatare-page">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-trade-accent" />
        <h2 className="text-base font-heading font-bold text-trade-text-primary">Ghid Complet de Analiza Tehnica</h2>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setOpenSections(new Set(SECTIONS.map((_, i) => i)))}
          className="text-xs text-trade-accent hover:underline">Deschide toate</button>
        <span className="text-trade-text-secondary">|</span>
        <button onClick={() => setOpenSections(new Set())}
          className="text-xs text-trade-accent hover:underline">Inchide toate</button>
      </div>
      <div className="space-y-2">
        {SECTIONS.map((section, idx) => (
          <AccordionItem key={idx} section={section} isOpen={openSections.has(idx)} onToggle={() => toggle(idx)} />
        ))}
      </div>
    </div>
  );
}
