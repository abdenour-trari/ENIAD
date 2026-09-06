def words_count(chaine):
    words_counter = 0
    for i in chaine:
        if i == ' ' or i == '\'':
            words_counter = words_counter+1
    return words_counter+1

print(words_count(" Abdenour  est un ingenieur de math à la fac de Oujda Ump l'exemple"))