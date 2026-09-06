def ret_index(chaine, caracter):
    list_index = []
    for i in range(len(chaine)):
        if chaine[i] == caracter:
            list_index.append(i)
    return list_index

print(ret_index("Abdenour TRARIs fils des Mohamed TRARI" , 's'))