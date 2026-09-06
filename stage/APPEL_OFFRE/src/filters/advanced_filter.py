def filter_advanced(offres, criteria):
    def match_critere(offre, critere, valeur):
        if not valeur:
            return True
        valeur = valeur.lower().strip()
        champ_val = str(offre.get(critere, "")).lower()
        return valeur in champ_val

    filtered = []
    for offre in offres:
        ok = True
        for critere, valeur in criteria.items():
            if critere == "site":
                continue
            if not match_critere(offre, critere, valeur):
                ok = False
                break
        if ok:
            filtered.append(offre)
    return filtered
