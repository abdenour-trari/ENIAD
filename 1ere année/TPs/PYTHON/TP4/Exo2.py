def form_tri(cara):
    for i in range(0,6):
        print(cara * i)


def form_tri2(cara):
    for i in range(0,6):
        for j in range(0, i):
            print(cara)
        print("\n")

form_tri2('*')
