def liste_p(n):
    l = []
    for i in range(n):
        if i % 2 != 0 :
            l.append(i)
    return l

print(liste_p(10))