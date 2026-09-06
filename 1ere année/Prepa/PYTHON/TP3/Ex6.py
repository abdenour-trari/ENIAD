def word_count(chaine):
    i = 0
    cp = 0
    while chaine[i] == " " :
        i += 1
    for j in range(i,len(chaine)):
        if chaine[j] == " " :
            cp += 1 
    
    return cp+1


print(word_count("        Abdenour Trari aklscn lkasmc alsknc"))
