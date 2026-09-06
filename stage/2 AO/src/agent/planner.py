from .base import AgentBase
from ..models.llm_wrapper import LLMWrapper
from ..utils.logger import logger

class Planner(AgentBase):
    def __init__(self, name="Planner"):
        super().__init__(name)
        self.llm = LLMWrapper()

    def plan(self, offer):
        # Simple plan: check relevance -> if relevant generate draft
        prompt = f"Voici un appel d'offre:\nTitre: {offer.get('title')}\nDeadline: {offer.get('deadline')}\n\nDonne 3 actions à accomplir pour répondre à cet appel d'offres."
        resp = self.llm.generate(prompt, max_tokens=300)
        logger.info("Plan generated")
        return resp
