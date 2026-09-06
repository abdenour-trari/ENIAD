# minimal vectorstore wrapper (file-based)
import os
import json
from ..utils.logger import logger

class VectorStore:
    def __init__(self, path=None):
        if path is None:
            path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "vectorstore", "vs.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.path = path
        if not os.path.exists(self.path):
            with open(self.path, "w", encoding="utf-8") as f:
                json.dump([], f)

    def add(self, meta):
        arr = self._load()
        arr.append(meta)
        self._save(arr)

    def _load(self):
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self, arr):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(arr, f, ensure_ascii=False, indent=2)
