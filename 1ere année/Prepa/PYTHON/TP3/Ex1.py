import math 

def cube(n):
    return n ** 3

def volumeSphere(n):
    return (4* math.pi * cube(n))/3

print(f"Le volume du cercle du rayon r = 4 est V = {volumeSphere(4):.2f}")