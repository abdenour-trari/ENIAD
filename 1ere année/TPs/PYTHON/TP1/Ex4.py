def calc_sum(n):
    try :
        somme = 0
        for i in range(n+1):
            somme = somme + i
        return somme
    except TypeError :
        print("Erreur : Vous  avez entrer un nombre n'est pas entier!")


n = input("Veuillez entrer un nombre : ")
print(calc_sum(int(n)))

