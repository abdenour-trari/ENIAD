moyennes_T1 = {
    "Célestine": 11, "Cédric": 10, "Farida": 16, "Zélie": 12, "Fatoumata": 15,
    "Colombin": 19, "Ophélie": 12, "Gauvin": 9, "Rodolphe": 11, "Ariel": 16,
    "Perrine": 20, "Hippolyte": 20, "Delphine": 11, "Bertrand": 13, "Awa": 18,
    "Perrette": 10, "Eulalie": 16, "Moussa": 20, "Issa": 10, "Marcelin": 14,
    "Barnabé": 10, "Léonce": 14, "Everiste": 7, "Jean": 17, "Anceline": 9,
    "Léontine": 9, "Maya": 14, "Pablo": 19, "Bernard": 10, "Vinciane": 19,
    "Daphné": 18, "Ludovic": 9
}

print(moyennes_T1['Maya'])
moyennes_T1.update({'Gauvin' : 10})
print(moyennes_T1['Gauvin'])
print(len(moyennes_T1))
moyennes_T1['Alfred'] = 14
print(moyennes_T1)