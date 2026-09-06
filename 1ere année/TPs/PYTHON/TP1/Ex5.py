from os.path import exists


def fibonacci(n):
    list_fibonacci = []
    list_fibonacci.append(0)
    list_fibonacci.append(1)
    for i in range(2,n):
        list_fibonacci.append(list_fibonacci[i-1] + list_fibonacci[i-2])
    return list_fibonacci



n = input("Enter a number: ")
print(fibonacci(int(n)))
