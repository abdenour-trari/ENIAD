T = input("Donner une date en second : ")
T = int(T)
M = T/60
T = T%60
H = M/60
M = M%60

print(f"T = {int(T)} seconds => {int(H)}H:{int(M)}M:{T}s")
