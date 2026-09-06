def pgcd(a, b):
    if a < b :
        pgcd(b, a)
    else:
        while b != 0:
            a, b =b , a % b
        return a

a = int(input("Entrer the first number: "))
b = int(input("Entrer the second number: "))

print(pgcd(a,b))