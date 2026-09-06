def cumul_valeurs(t):
    new_t = []
    somme = 0
    for i in t: 
        somme += i
        new_t.append(somme)
    
    return new_t
print([1,4,7])
print(cumul_valeurs([1,4,7]))