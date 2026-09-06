def switch(cat , price):
    if price < 0 :
        raise ValueError("Le prix doit etre > 0 !")
    
    if cat == "A" :
        return 0.07 * price
    elif cat == "B":
        return 0.2 * price
    elif cat == "C":
        return 0.25 * price
    else :
        return "category not found"


try : 

    while True:
        price = int(input("Donner le prix : "))
        cat = input("Donner la categorie de ce produit : ")
        if switch(cat , price) != "category not found" : 
            print(f"le TTC du produit est : {switch(cat , price)}")
            break
        else : 
            print(switch(cat , price))

except Exception :
    print("Veuillez entrer un prix valide !")

