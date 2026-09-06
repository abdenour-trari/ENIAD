try:
    time = int(input("Donner un entier : "))
    H = time//3600
    M = (time%3600)//60
    S = (time%3600)%60
    print(f"{H}h : {M}m : {S}s")
except Exception:  
    print("Erreur : Veuillez saisir un entier !")
