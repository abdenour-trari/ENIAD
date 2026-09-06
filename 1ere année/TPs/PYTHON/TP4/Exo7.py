def replace_not_poor(chaine):
    cp = 0
    if chaine.find("not") and chaine.find("poor"):
        return True


print(replace_not_poor("Abdenour est ascas acklnasc ascasc not etudiant"))