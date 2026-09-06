def append_div(number):
    list_divide = []
    for i in range(1,1000):
        if number % i == 0:
            list_divide.append(i)
    return list_divide

print(append_div(865))