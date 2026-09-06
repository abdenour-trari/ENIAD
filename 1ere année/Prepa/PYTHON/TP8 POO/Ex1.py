class Compte:
    def __init__(self, nom, numero, balance):
        self.__nom = nom
        self.__numero = numero
        self.__balance = balance

    # getters
    @property
    def nom(self):
        return self.__nom
    
    @property
    def numero(self):
        return self.__numero
    
    @property
    def balance(self):
        return self.__balance

    # setters
    @nom.setter 
    def nom(self, nom):
        self.__nom = nom
    
    @numero.setter 
    def numero(self, numero):
        self.__numero = numero
    
    @balance.setter 
    def balance(self, balance):
        self.__balance = balance

    def retirer(self, amount):
        if amount > self.__balance:
            print("Fonds insuffisants.")
        else:
            self.__balance -= amount
            print(f"Solde retiré : {amount} DH")

    def deposer(self, amount):
        self.__balance += amount
        print(f"Solde déposé : {amount} DH")
    

C1 = Compte("Asmaa", 12345, 20000)
C1.deposer(3000)
C1.retirer(800)
C1.nom = "Moha"  
print(f"La balance de {C1.nom} est : {C1.balance} DH")
