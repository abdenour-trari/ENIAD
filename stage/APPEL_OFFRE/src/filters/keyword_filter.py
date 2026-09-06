def filter_by_keyword(offres, keyword):
    if not keyword:
        return offres
    keyword = keyword.lower()
    return [
        offre for offre in offres
        if any(keyword in str(value).lower() for value in offre.values())
    ]
