def capitalized(chaine):
    new_chaine = chaine.split()
    new_chaine[0] = new_chaine[0].upper()
    chaine = ""
    for i in new_chaine:
        chaine += (i + " ")
    return chaine

print(capitalized("abdenour trari"))