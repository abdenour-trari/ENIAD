def moy_ele(dic):
    for eleve, notes in dic.items():
        if notes:  
            moyenne = sum(notes) / len(notes)
            dic[eleve] = {'notes': notes, 'moyenne': moyenne}
        else:
            dic[eleve] = {'notes': notes, 'moyenne': None}


dic_ele = {}

nom = input("Donner le nom de l'élève : ")

liste_notes = []
while True:
    note = input("Donner la note (ou tapez 'done' pour terminer) : ")
    if note.lower() == "done":
        break
    try:
        liste_notes.append(float(note))
    except ValueError:
        print("Veuillez entrer une valeur numérique valide.")


dic_ele[nom] = liste_notes

moy_ele(dic_ele)


for eleve, infos in dic_ele.items():
    print(f"Élève : {eleve}")
    print(f"Notes : {infos['notes']}")
    if infos['moyenne'] is not None:
        print(f"Moyenne : {infos['moyenne']:.2f}")
    else:
        print("Aucune note disponible pour calculer la moyenne.")
