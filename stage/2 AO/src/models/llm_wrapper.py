import os
from ..utils.logger import logger

class LLMWrapper:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self.api_key = os.getenv("OPENAI_API_KEY", None)

    def generate(self, prompt, max_tokens=300):
        # very small stub: si clé OPENAI fournie, utiliser API, sinon renvoyer un mock
        if self.provider == "openai" and self.api_key:
            try:
                import openai
                openai.api_key = self.api_key
                resp = openai.ChatCompletion.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    messages=[{"role":"user","content":prompt}],
                    max_tokens=max_tokens,
                    temperature=0.2
                )
                text = resp.choices[0].message.content
                return text
            except Exception as e:
                logger.exception("OpenAI request failed, falling back to mock.")
        # fallback mock
        return f"[MOCK LLM RESPONSE]\nPrompt summary: {prompt[:200]}..."

    def embed(self, texts):
        # naive numeric vector stub
        return [[float(len(t))] for t in (texts if isinstance(texts, list) else [texts])]
