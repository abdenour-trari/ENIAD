"""
Package principal du projet 'appels-offres-maroc'.
Ce package contient :
- scrapers : modules de scraping
- filters  : filtres pour les données
- interfaces : API Flask et Web UI
- utils    : outils et configuration
"""

__version__ = "1.0.0"
__author__ = "Abdenour TRARI"

# Import clé facultatif pour accès direct depuis `src`
from .utils.config import config
from .utils.logger import logger
