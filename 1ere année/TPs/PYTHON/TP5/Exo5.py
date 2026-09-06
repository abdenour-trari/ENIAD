list_doublons = [1, 2, 2, 3, 4, 5, 5, 5, 6, 7, 7, 8, 9, 10]
resultat = []
for element in list_doublons:
    if element not in resultat:
        resultat.append(element)
print(resultat)

# Avec les méthodes de liste
list_doublons = [1, 2, 2, 3, 4, 5, 5, 5, 6, 7, 7, 8, 9, 10]
resultat = list(set(list_doublons))
resultat.sort(key=list_doublons.index)
print(resultat)
