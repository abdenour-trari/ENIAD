from .base import AgentBase
from ..utils.logger import logger
from ..models.llm_wrapper import LLMWrapper

class Executor(AgentBase):
    def __init__(self, name="Executor"):
        super().__init__(name)
        self.llm = LLMWrapper()

    def execute(self, plan_text, offer):
        # Transform the plan into a draft de réponse
        prompt = f"Tu es un assistant qui rédige un brouillon de réponse pour un appel d'offre.\nAppel d'offre: {offer.get('title')}\nPlan:\n{plan_text}\nGénère un brouillon formel (max 400 mots)."
        draft = self.llm.generate(prompt, max_tokens=600)
        logger.info("Execution produced a draft")
        return draft
