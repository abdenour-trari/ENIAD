# -------------------------
# Page 2
# -------------------------

# Partie 1
masse = int(input("Donner la masse : "))
vitesse = int(input("Donner la vitesse : "))
energie_cinetique = 0.5 * masse * vitesse**2
print("Énergie cinétique =", energie_cinetique, "joules")

# Partie 2
import math
a = 3
b = 4
c = math.sqrt(a**2 + b**2)
print("Hypoténuse =", c)

# Partie 3
x1, y1, z1 = 1, 2, 3
x2, y2, z2 = 4, 6, 3
distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2)
print("Distance entre les points =", distance)

# -------------------------
# Page 3
# -------------------------

# Phrase donnée
phrase = "Python est un langage puissant et flexible."
print("Nombre de caractères :", len(phrase))
print("Première lettre :", phrase[0])
print("Dernière lettre :", phrase[-1])
print("'Python' est présent :", "Python" in phrase)
print("Avec tirets :", phrase.replace(" ", "-"))
print("Nombre de 'a' :", phrase.count("a"))
print("En majuscules :", phrase.upper())
print("En minuscules :", phrase.lower())
print("Phrase inversée :", phrase[::-1])
print("Avec majuscule sur chaque mot :", phrase.title())
mot = input("Entrez un mot pour vérifier s’il est un palindrome : ")
if mot == mot[::-1]:
    print("C'est un palindrome.")
else:
    print("Ce n'est pas un palindrome.")
print("Phrase sans espaces :", phrase.replace(" ", ""))

# -------------------------
# Page 4
# -------------------------

# Ex1
ancienne_valeur = float(input("Entrez l'ancienne valeur (en mm) : "))
nouvelle_valeur = float(input("Entrez la nouvelle valeur (en mm) : "))
if nouvelle_valeur >= ancienne_valeur:
    pluie = nouvelle_valeur - ancienne_valeur
    print("Pluie tombée =", pluie, "mm")
else:
    print("Capteur réinitialisé. Pluie tombée = 0 mm")

# Ex2
x_exact = float(input("Entrez la valeur exacte : "))
x_approx = float(input("Entrez la valeur approchée : "))
ea = abs(x_exact - x_approx)
er = ea / abs(x_exact)
if er < 0.01:
    print("Erreur négligeable")
elif 0.01 <= er < 0.05:
    print("Erreur modérée")
else:
    print("Erreur importante")

# Ex3
matrice = []
for i in range(3):
    ligne = []
    for j in range(3):
        valeur = float(input(f"Entrez a_{i+1}{j+1} : "))
        ligne.append(valeur)
    matrice.append(ligne)
dominante = True
for i in range(3):
    diag = abs(matrice[i][i])
    autres = sum(abs(matrice[i][j]) for j in range(3) if j != i)
    if diag <= autres:
        dominante = False
if dominante:
    print("Matrice diagonale dominante")
else:
    print("Matrice non diagonale dominante")

# Ex4
x_old = float(input("Entrez x_prec (valeur précédente) : "))
x_new = float(input("Entrez x_actuel (valeur actuelle) : "))
tol = float(input("Entrez la tolérance : "))
type_erreur = input("Type d'erreur ('absolue' ou 'relative') : ").lower()
if type_erreur == "absolue":
    erreur = abs(x_new - x_old)
elif type_erreur == "relative":
    if x_new != 0:
        erreur = abs(x_new - x_old) / abs(x_new)
    else:
        erreur = float("inf")
else:
    print("Type d'erreur non reconnu")
    erreur = None
if erreur is not None:
    if erreur < tol:
        print("Convergence atteinte")
    else:
        print("Pas encore convergé")

# -------------------------
# Page 6
# -------------------------

# Ex1
i = 1
while i <= 20:
    if i % 3 == 0:
        i += 2
    else:
        i += 1
    print(i)

# Ex2
marrakech = 1000000
agadir = 500000
annees = 0
while agadir <= marrakech:
    marrakech += 50000
    agadir *= 1.08
    annees += 1
print(annees)

# Ex3
n = int(input())
u = 6
for i in range(n):
    u = 4 * u + 10
print(u)

# Ex4
n = int(input())
u0, u1 = 0, 1
print(u0, u1, end=' ')
while True:
    u2 = u0 + u1
    if u2 > n:
        break
    print(u2, end=' ')
    u0, u1 = u1, u2

# Ex5
n = int(input())
somme = 0
for i in range(1, n + 1):
    somme += (2 * i - 1) ** 2
print(somme)

# -------------------------
# Page 7
# -------------------------

# Ex1
n = input()
print(n[::-1])

# Ex2
lst = [1, 2, 0, 6, 9, 0, 0, 8, 0, 0, 3]
res = [x for x in lst if x != 0]
zeros = [0] * (len(lst) - len(res))
res += zeros
print(res)

# -------------------------
# Page 9
# -------------------------

# Ex1
n = int(input())
notes = []
for i in range(n):
    note = float(input())
    notes.append(note)
print(notes)
moyenne = sum(notes) / n
print(moyenne)
print(max(notes))
print(min(notes))
for note in notes:
    if note > moyenne:
        print(note)
notes.sort()
print(notes)

# Ex2
phrase = input()
mots = phrase.split()
print(len(mots))
long_mot = max(mots, key=len)
print(long_mot)
for i in range(len(mots)):
    if len(mots[i]) < 4:
        mots[i] = "***"
print(mots)
mots.sort()
print(mots)

# Ex3
produits = []
for i in range(5):
    nom = input()
    quantite = int(input())
    produits.append([nom, quantite])
print(produits)
nom_produit = input()
for produit in produits:
    if produit[0] == nom_produit:
        print(produit[1])
        break
else:
    print("N'existe pas")
nom_modif = input()
quantite_modif = int(input())
for produit in produits:
    if produit[0] == nom_modif:
        produit[1] = quantite_modif
        break
print(produits)
