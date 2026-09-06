import os


SCRAPER_SETTINGS = {
    "BASE_URL": "https://www.marchespublics.gov.ma",
    "TIMEOUT": 20,
    "USER_AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

DB_PATH = os.path.join(os.path.dirname(__file__), "tenders.db")
OPENAI_API_KEY = "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"
DEEPSEEK_API_KEY = "sk-bf727168040f412a928021c99fc341fb"
GEMINI_API_KEY = "AIzaSyBLOx3v_YM2BW8-vj1MiuEglBCuAZuBbv0"
GROK_API_KEY = "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"