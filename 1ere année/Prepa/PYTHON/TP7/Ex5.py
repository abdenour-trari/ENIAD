def comptage(mot):
    liste_mots = list(mot)
    dic = {}
    cp = 0 
    for i in range(len(liste_mots)):
        for j in range(0,len(liste_mots)):
            if liste_mots[i] == liste_mots[j]:
                cp += 1
        dic[liste_mots[i]] = cp
        cp = 0
        
    
    
    return dic

print(comptage("abdeennourqa"))