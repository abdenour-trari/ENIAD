import time

class InteractionManager:
    def __init__(self, target_word, cooldown):
        self.target_word = target_word
        self.cooldown = cooldown
        self.current_word = ""
        self.last_click_time = 0
        self.last_key = None

    def update(self, touched_key):
        if touched_key is None:
            self.last_key = None
            return None

        if touched_key != self.last_key:
            self.last_click_time = time.time()
            self.last_key = touched_key

        if time.time() - self.last_click_time > self.cooldown:
            self.last_click_time = time.time()

            if touched_key == "RESET":
                self.current_word = ""
                return {"action": "reset"}

            if len(self.current_word) < len(self.target_word):
                expected = self.target_word[len(self.current_word)]
                if touched_key == expected:
                    self.current_word += touched_key
                    return {
                        "action": "valid",
                        "letter": touched_key,
                        "current_word": self.current_word
                    }

        return None