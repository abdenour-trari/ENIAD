import math

def variance(t):
    moyenne = sum(t)/len(t)
    somme = 0
    for i in t :
        somme += (i-moyenne)**2

    return somme/len(t)


print(variance((1,5,3,2,6,1,3)))