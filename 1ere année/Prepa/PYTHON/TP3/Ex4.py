def nombre_v(chaine):
    cp = 0  
    for i in chaine:
        if i in ['e','i','a','o','u']:
            cp += 1
    return cp 

print(f"Nombre de voyelle dans la chaine 'Abdenour' est : {nombre_v("Abdenoooour")}") 