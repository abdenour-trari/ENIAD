def suite(n):
    L = []
    if n == 0 :
        return 0
    else:
        while n > 0:
            L.append(2 * n + 1)
            n -= 1
    return L

def somme_suite(n):
    somme = 0
    return sum(suite(n))

print(suite(3))
print(somme_suite(3))