def is_premier(n):
    if n < 2 :
        return True
    for i in range(2,n):
        if n % i == 0:
            return False
    return True

def verify_ju(nPremier_list):
    ju_list = []
    for i in range(0,len(nPremier_list)):
        somme = nPremier_list[i] - nPremier_list[i-1]
        if somme == 2:
            ju_list.append((nPremier_list[i-1] , nPremier_list[i]))
    return ju_list


def premier_jumeaux():
    nPremier_list = [1]
    for i in range(2,1000):
        if is_premier(i):
            nPremier_list.append(i)

    ju_list = verify_ju(nPremier_list)
    return nPremier_list

print(premier_jumeaux())

