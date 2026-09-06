def delete_spaces(chaine):
    chaine2 = ""
    for i in chaine:
        if i != ' ':
            chaine2 += i
    return chaine2

print(delete_spaces("Abdenour est un ingenieur"))