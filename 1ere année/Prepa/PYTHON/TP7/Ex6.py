def egaux(n):
    lis_ = []
    lis_2 = []
    for i in range(1000):
        if i % 2 != 0 :
            lis_.append(i)
    for i in lis_ :
        for j in lis_ :
            if i + j == n:
                lis_2.append((i,j))
    return lis_2

print(egaux(12))