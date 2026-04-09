"""
Chart Analyzer - AI-powered trading chart analysis using Gemini via Emergent Integrations.
Accepts base64 image of a trading chart and returns professional technical analysis.
"""
import os
import uuid
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

log = logging.getLogger("chart_analyzer")

SYSTEM_PROMPT = """Esti un analist tehnic profesionist cu experienta vasta in pietele financiare.
Analizeaza imaginea cu graficul de trading si ofera o analiza detaliata care include:

1. **Identificare Pattern-uri**: Candlestick patterns vizibile (Doji, Hammer, Engulfing, Head&Shoulders, etc.)
2. **Trend**: Directia trendului principal si secundar
3. **Niveluri Cheie**: Suport si rezistenta vizibile pe grafic
4. **Indicatori Vizibili**: Interpretarea oricaror indicatori vizibili (MA, RSI, MACD, Bollinger Bands, Volume)
5. **Volum**: Analiza volumului daca este vizibil
6. **Semnal de Trading**: Recomandare BUY / SELL / WAIT cu explicatie clara
7. **Risc/Recompensa**: Sugestii pentru Entry, Stop Loss, Take Profit
8. **Observatii Suplimentare**: Orice alte pattern-uri, formatiuni sau elemente relevante

Raspunde in limba romana. Fii concis dar cuprinzator. Foloseste formatare Markdown."""


async def analyze_chart_image(image_base64: str, user_prompt: str = "") -> str:
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return "Eroare: Cheia API pentru analiza nu este configurata."

        chat = LlmChat(
            api_key=api_key,
            session_id=f"chart-{uuid.uuid4().hex[:8]}",
            system_message=SYSTEM_PROMPT
        ).with_model("gemini", "gemini-2.5-flash")

        image = ImageContent(image_base64=image_base64)
        text = user_prompt if user_prompt else "Analizeaza acest grafic de trading si ofera o analiza tehnica detaliata."
        message = UserMessage(text=text, file_contents=[image])

        response = await chat.send_message(message)
        return response
    except Exception as e:
        log.error(f"Chart analysis error: {e}")
        return f"Eroare la analiza graficului: {str(e)}"
