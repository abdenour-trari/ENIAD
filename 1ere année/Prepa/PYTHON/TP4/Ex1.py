def terme_triple():
    list_ = []
    list_.append(1)
    for i in range(1,13):
        list_.append(list_[i-1]*3)
    print(list_)

terme_triple()