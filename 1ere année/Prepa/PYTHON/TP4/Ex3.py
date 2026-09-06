def decoupe_chaine(chaine):
    cp = 0
    concatened_chaine = ""
    splited_c = []
    for i in chaine:
        concatened_chaine += i
        cp += 1
        if cp % 5 == 0:
            splited_c.append(concatened_chaine)
            concatened_chaine = ""

    # Ajouter le reste s'il existe
    if concatened_chaine:
        splited_c.append(concatened_chaine)
    
    splited_c.reverse()
    return splited_c

print(decoupe_chaine("Abdenour TRARI JOJO KOKO"))
