def dic(books_dictionnary):
    dictionnary = {}
    list_values = []
    for i in books_dictionnary:
        for value in i.values():
            list_values.append(value)
        dictionnary[list_values[0]] = list_values[1]
        list_values.clear()

            
    return dictionnary





livres = [
{
    "titre": "Dune",
    "auteur": "Frank Herbert"
},
{"titre": "1984", "auteur": "George Orwell"},
{"titre": "Le Meilleur des mondes", "auteur": "Aldous Huxley"},
{"titre": "Fondation", "auteur": "Isaac Asimov"},
{"titre": "La Ferme des animaux", "auteur": "George Orwell"},
]

dictinnaire = dic(livres)

for key,value in dictinnaire.items():
    print(key, " : " , value)