import os
import yaml

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_config(path=None):
    if path is None:
        path = os.path.join(BASE_DIR, "configs", "agent_config.yaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

CONFIG = load_config()
