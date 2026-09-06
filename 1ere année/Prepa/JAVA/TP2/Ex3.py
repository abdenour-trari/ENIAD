def div_communs(m,n):
    if m < 0 or n < 0 :
        raise ValueError("les entiers doivent etre positifs")
    commun = []
    for i in range(1,min(n,m)):
        if n % i == 0 and m % i == 0:
            commun.append(i);
    return commun

try:
    m , n = int(input("donner le 1er nombre : ")) , int(input("donner le 2eme nombre : "))
    print(div_communs(m,n))
except ValueError :
    print("les nombres entres doivent etre des entiers !")