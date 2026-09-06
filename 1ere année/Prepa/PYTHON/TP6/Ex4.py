def liste_p(l):
    l.insert(0,l.pop())
    return l

print(liste_p([1,5,3,4]))