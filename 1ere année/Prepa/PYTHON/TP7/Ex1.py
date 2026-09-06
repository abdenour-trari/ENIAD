dictionnaire_fr_ang = {
    'voiture' : 'Car' ,
    'arbre' : 'Tree' ,
    'ordinateur' : 'Computer' ,
    'sourit' : 'Mouse' ,
    'chien' : 'Dog' ,
    'chat' : 'Cat',
    'clavier' : 'Keybord',
    'livre' : 'book'
}

def traduction(mot_fr):
    for key in dictionnaire_fr_ang :
        if key == mot_fr.lower() :
            return dictionnaire_fr_ang[key]
    return "Ce mot n'existes pas dans notre dicrtionnaire !"

key = input("Donner le mot a traduire : ")

print(traduction(key))
