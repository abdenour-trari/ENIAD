# Classe de base Personne
class Personne:
    def __init__(self, nom, age):
        self._nom = nom      # Attribut protégé
        self._age = age      # Attribut protégé

    def __str__(self):
        return f"Nom: {self._nom}, Âge: {self._age}"

class Employe(Personne):
    def __init__(self, nom, age, salaire):
        super().__init__(nom, age)  
        self._salaire = salaire      

    def show_salary(self):
        print(f"Le salaire de {self._nom} est de {self._salaire} DH")

class Manager(Employe):
    def __init__(self, nom, age, salaire, equipe):
        super().__init__(nom, age, salaire)  
        self._equipe = equipe  

    def show_salary(self):
        super().show_salary() 
        print(f"{self._nom} gère l'équipe: {', '.join(self._equipe)}")


# Création d'objets pour tester les classes et méthodes
personne1 = Personne("Alice", 30)
employe1 = Employe("Bob", 40, 5000)
manager1 = Manager("Charlie", 50, 8000, ["David", "Eve", "Frank"])

# Test des méthodes
print(personne1)           # Affichage des infos de Personne
employe1.show_salary()     # Affichage du salaire de l'employé
manager1.show_salary()     # Affichage du salaire du manager et de son équipe
