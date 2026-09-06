def PGCD(n, m):
    while m != 0:  # Tant que m n'est pas nul
        n, m = m, n % m  # Mise à jour simultanée des valeurs
    return abs(n)  # Retourne la valeur absolue


print(PGCD(98, 56))  # Affiche 14
