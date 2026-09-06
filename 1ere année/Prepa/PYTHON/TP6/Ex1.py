def second_max(L):
    second = L[0]
    for i in range(1,len(L)) :
        if L[i] > second and L[i] < max(L):
            second = L[i]
    return second
    
print(second_max([10,5,15,19,20,100]))