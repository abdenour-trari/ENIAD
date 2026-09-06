from datetime import datetime

def format_date(date_str: str, fmt="%d/%m/%Y"):
    try:
        return datetime.strptime(date_str, fmt).date()
    except:
        return None
