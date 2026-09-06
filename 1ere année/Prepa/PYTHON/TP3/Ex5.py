def delete_spaces(chaine):
    new_chaine = ""
    C = chaine.split()
    for i in C :
        new_chaine += i
    return new_chaine

print(f"La chaine 'Abdenour est un ingenieur'sans espace : {delete_spaces("Abdenour est un ingenieur")}")
