import os
import yaml
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CONFIG_PATH = BASE_DIR / "configs" / "agent_config.yaml"

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    # Remplacer les variables d'environnement
    for key, val in cfg.get("llm", {}).items():
        if isinstance(val, str) and val.startswith("${") and val.endswith("}"):
            env_var = val[2:-1]
            cfg["llm"][key] = os.getenv(env_var, "")
    return cfg
