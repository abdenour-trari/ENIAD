from imaplib import Flags
from webbrowser import Error


def is_premier(n):
    if n < 2 :
        return True
    for i in range(2,n):
        if n % i == 0:
            return False
    return True

def nombre_premier(a , b):
    if a > b :
        raise ValueError("b must be more bigger than a")

    try:
        numbers_list = []

        for i in range(a, b):
            if is_premier(i):
                numbers_list.append(i)

        return numbers_list
    except ValueError as e:
        print(e)


a = int(input("Entrer the fisrts number : "))
b = int(input("Entrer the second number : "))

print(nombre_premier(a,b))