def fact(n):
    if n == 0 or n ==1 :
        return 1 
    else:
        return n * fact(n-1)



n = int(input("Donner un nombre : "))
print(f"Son factorielle est :  {fact(n)}")


true = True
facto = 1
while true:
    if n <= 1 :
        true = False
        break
    else :
        facto = facto * n
        n -= 1

print(f"Son factorielle est :  {facto}")

