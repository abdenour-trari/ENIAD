from agent.tools import AO_Tools
from agent.memory import insert_tender

def update_tenders(max_pages=None):
    tenders = AO_Tools.get_detailed(max_pages=max_pages)
    for t in tenders:
        insert_tender(t)
    return len(tenders)
