from back_end.src.scrapers.pmmp_categories import fetch_pmmp_categories
from back_end.src.scrapers.detailed_tenders import fetch_detailed_tenders

class AO_Tools:
    @staticmethod
    def get_pmmp():
        return fetch_pmmp_categories()

    @staticmethod
    def get_detailed(max_pages=None):
        return fetch_detailed_tenders(max_pages=max_pages)
