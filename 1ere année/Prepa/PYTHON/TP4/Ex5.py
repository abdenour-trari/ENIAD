def find_word(chaine, c):
    cp = [] 
    for i in range(len(chaine)):
        if chaine[i].lower() == c :
            cp.append(i)
    return cp

print(find_word("AbdennourAaa",'a'))