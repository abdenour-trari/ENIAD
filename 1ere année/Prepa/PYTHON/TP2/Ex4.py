def conversion(device,amount):
    if device == 1 : 
        return "GBP" , amount * 0.83
    elif device == 2 :
        return "USD" , amount * 1.04
    elif device == 3 :
        return "JPY" , amount * 164 


m = float(input("Le montant en EUR : "))
d = int(input("1 : GBP \n2 : USD\n3 : JPY : "))

device, amount = conversion(d,m)
print(f"Le mantant en {device} est {amount}")
