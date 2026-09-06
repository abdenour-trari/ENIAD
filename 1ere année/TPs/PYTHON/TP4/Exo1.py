def tripleNumber():
    list_val = []
    list_val.append(1)
    for i in range(1,13):
        a = list_val[i - 1] * 3
        list_val.append(a)
    print(list_val)


tripleNumber()