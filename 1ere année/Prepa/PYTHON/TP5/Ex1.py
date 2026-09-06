x = [1, 2, 3]
y = x

print(x,y)

x[1] = -15

print(x,y)

x = [1, 2, 3]
y = x[:] #ou y = list(x)
x[1] = -15
print(x)
print(y)