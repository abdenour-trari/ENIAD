def div(n):
    list_ = []
    for i in range(1,n):
        if n % i == 0:
            list_.append(i)
    return list_

print(div(312))
