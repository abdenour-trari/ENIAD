def deco_strig(chaine):
    if len(chaine) <= 2 :
        return []
    else:
        returned_word = ""
        returned_word += chaine[0]
        returned_word += chaine[1]

        i = 2
        while i < len(chaine):
            i += 1
        returned_word += chaine[i - 2]
        returned_word += chaine[i - 1]

        return returned_word

print(deco_strig("sa"))

