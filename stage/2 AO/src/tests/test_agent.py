def test_agent_smoke():
    from src.agent.tools import ScraperTool
    s = ScraperTool()
    items = s.fetch_listings()
    assert isinstance(items, list)
