def voyel_count(chaine):
    cp = 0
    for i in chaine:
        if i == 'a' or i == 'e' or i == 'u' or i == 'i' or i == 'o' or i == '':
            cp = cp+1
    return cp

print(voyel_count("Looofi"))