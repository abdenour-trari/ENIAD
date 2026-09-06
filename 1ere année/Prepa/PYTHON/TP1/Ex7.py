def transformer_entier(n):
    list_d = decoupe(n)
    if 1 <= somme(list_d) <= 9 : 
        new_list = ajoute(list_d,somme(list_d))
        return fusionner(new_list)
    else :
        new_d_l = decoupe(somme(list_d))
        new_list = ajoute(list_d,somme(new_d_l))
        return fusionner(new_list)
        

def decoupe(n):
    list_d = []
    while n > 0 :
        list_d.append(n%10)
        n = n//10
    list_d.reverse()
    return list_d 

def somme(list_d):
    return sum(list_d)

def ajoute(list_d , s):
    list_d.insert(0,s)
    return list_d

def fusionner(list_d):
    number = 0
    a = 1
    i = len(list_d)-1
    while i >= 0 :
        list_d[i] *= a
        a *= 10
        number += list_d[i] 
        i -= 1
        
    return number

print(transformer_entier(9867))



