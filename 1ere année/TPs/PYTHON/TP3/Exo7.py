def divide_words(chaine):
    ch = ""
    i = chaine[0]
    j = 0
    while i != ' ':
        ch += chaine[j]
        i = chaine[j]
        j=j+1
        
            
    return ch.upper()

print(divide_words("Abdenour hello words"))