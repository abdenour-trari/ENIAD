# src/models/llm_wrapper.py
from langchain_openai import ChatOpenAI

class LLMWrapper:
    def __init__(self, api_key):
        if not api_key:
            raise ValueError("La clé OpenAI n'est pas définie !")
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=api_key
        )

    def invoke(self, message: str):
        return self.llm.invoke(message)
