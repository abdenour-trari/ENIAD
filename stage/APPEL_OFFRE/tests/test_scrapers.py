import pytest
from src.scrapers.finances import scrape_finances_gov_ma
from src.scrapers.credit_agricole import scrape_credit_agricole_ma
from src.scrapers.pmmp import scrape_pmmp

def test_scrape_finances():
    results = scrape_finances_gov_ma()
    assert isinstance(results, list)

def test_scrape_credit_agricole():
    results = scrape_credit_agricole_ma()
    assert isinstance(results, list)

def test_scrape_pmmp():
    results = scrape_pmmp()
    assert isinstance(results, list)
