def suite(n):
    L = [0]
    i = 1
    while i < n :
        L.append(2 * L[i-1] + 1)
        i += 1
    
    return L,somme_suite(L)

def somme_suite(suite_):
    return sum(suite_)

print(suite(5))

        