def somme_nombres(n):
    if n < 0 :
        raise ValueError("Veuillez entrer une valeur positive !")
    if n == 0:
        return 0
    
    return n + somme_nombres(n-1)

n = input("Donner un entier : ")
print(f"La somme des nombre entre 1 et {n} est : {somme_nombres(int(n))}")