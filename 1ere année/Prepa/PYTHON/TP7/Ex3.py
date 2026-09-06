moyennes_T1 = {
    "Célestine": 11, "Cédric": 10, "Farida": 16, "Zélie": 12, "Fatoumata": 15,
    "Colombin": 19, "Ophélie": 12, "Gauvin": 9, "Rodolphe": 11, "Ariel": 16,
    "Perrine": 20, "Hippolyte": 20, "Delphine": 11, "Bertrand": 13, "Awa": 18,
    "Perrette": 10, "Eulalie": 16, "Moussa": 20, "Issa": 10, "Marcelin": 14,
    "Barnabé": 10, "Léonce": 14, "Everiste": 7, "Jean": 17, "Anceline": 9,
    "Léontine": 9, "Maya": 14, "Pablo": 19, "Bernard": 10, "Vinciane": 19,
    "Daphné": 18, "Ludovic": 9
}

def recherche_ele(nom):
    for key in moyennes_T1.keys():
        if key == nom :
            return f"{nom} est dans la classe"
    return f"{nom} n'est pas dans la classe"

def moy_ele():
    somme = 0
    for value in moyennes_T1.values() :
        somme += value
    return somme/len(moyennes_T1)

def elites():
    list_ = []
    for key in moyennes_T1.keys() :
        if moyennes_T1[key] > 15 :
            list_.append((key,moyennes_T1[key]))
    return list_

def ajoute_note():
    for key in moyennes_T1.keys() :
        moyennes_T1[key] += 1

print(recherche_ele('Gavi'))
print(recherche_ele('Maya'))
print(f"La moyenne de la classe : {moy_ele()}")
print(f"les elites > 15 : {elites()}")
ajoute_note()
print(moyennes_T1)