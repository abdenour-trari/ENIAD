def premier(m,n):
    liste_ = []
    for i in range(m,n+1):
        if i % 2 != 0 :
            liste_.append(i)
    return liste_


print(premier(10,20))