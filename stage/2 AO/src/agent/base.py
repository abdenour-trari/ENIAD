from ..utils.logger import logger

class AgentBase:
    def __init__(self, name="AoAgent"):
        self.name = name
        logger.info(f"Initializing Agent: {self.name}")

    def act(self, observation):
        raise NotImplementedError
