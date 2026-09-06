def nombre_d(n):
    list_ = decompose(n)
    for i in range(len(list_)):
        for j in range(i+1,len(list_)):
            if list_[i] == list_[j] :
                print(f"ce nombre est n'est pas dinstinct !{list_}")
                return 
    print("ce nombre est dinstinct !")

def decompose(n):
    list_ = []
    while n != 0 :
        list_.append(n%10)
        n = n//10
    return list_

nombre_d(17214)