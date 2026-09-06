print("Abdenour is not that poor")
chaine = "Abdenour is not that poor"

new_chaine = chaine.split()
cp = 0 
for i in new_chaine :
    cp += 1
    if i == 'not' : 
        break
boolean = False
for j in new_chaine[cp:]:
    if j == 'poor' : 
        boolean = True

if boolean :
    chaine = ""
    for i in new_chaine[:cp-1]:
        chaine += (i + " ")
    print(chaine,"poor!")