class Etudiant:
    id = 0
    repertoire = [] 

    def __init__(self,nom,prenom):
        Etudiant.id += 1
        self.__nom = nom
        self.__prenom = prenom
        self.__eid = Etudiant.id

        Etudiant.repertoire.append(self)
    
    def __str__(self):
        return f"Id_Etudiant : {self.__eid}\nNom : {self.__nom}\nPrenom : {self.__prenom}"

e1 = Etudiant("TRARI","Abdenour") 
e2 = Etudiant("BENBADDA","Mohamed") 
e3 = Etudiant("BENBADDA","Mohamed") 
e4 = Etudiant("BENBADDA","Mohamed") 
e5 = Etudiant("BENBADDA","Mohamed") 
for i in Etudiant.repertoire:
    print(i)

         