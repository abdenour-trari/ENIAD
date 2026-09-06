def incr_string(chaine, index):
    # Retourne une sous-chaîne à partir de l'index donné
    return chaine[index:]

def first_five_letters(chaine):
    word_F = ""
    i = 0

    # Ignorer les espaces au début de la chaîne
    while i < len(chaine) and chaine[i] == " ":
        i += 1

    # Ajouter les 5 premières lettres non-espace
    while i < len(chaine) and len(word_F) < 5:
        if chaine[i] != " " :
            word_F += chaine[i] # Ajouter uniquement les caractères non-espace
        i += 1
    return word_F, i  # Retourne aussi l'index mis à jour

def reverse_string(chaine):
    list_words = []
    i = 0
    while i < len(chaine):
        word, i = first_five_letters(chaine[i:])  # Extraire les 5 premières lettres à partir de l'index courant
        list_words.append(word)  # Ajouter le segment à la liste
    list_words.reverse()  # Inverser la liste de mots
    return list_words


# Test
print(reverse_string("       Hello World je suis abdenour TRARI"))
