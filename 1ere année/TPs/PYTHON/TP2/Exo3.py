

def divide_list(m , n):
    if m > n :
        raise ValueError("a must be less than b")
    try:
        di_list = []
        for i in range(1 , n):
            if m % i == 0 and n % i == 0:
                di_list.append(i)
        return di_list
    except ValueError:
        print("Error")
a = 150
b = 1550
print(divide_list(a,b))