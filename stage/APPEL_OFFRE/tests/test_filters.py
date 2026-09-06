from src.filters.keyword_filter import filter_by_keyword
from src.filters.advanced_filter import filter_advanced

mock_data = [
    {"numero_ao": "123", "objet": "Travaux publics", "lieu": "Rabat"},
    {"numero_ao": "456", "objet": "Fournitures scolaires", "lieu": "Casablanca"}
]

def test_filter_by_keyword():
    results = filter_by_keyword(mock_data, "Travaux")
    assert len(results) == 1

def test_filter_advanced():
    criteria = {"lieu": "Rabat"}
    results = filter_advanced(mock_data, criteria)
    assert len(results) == 1
