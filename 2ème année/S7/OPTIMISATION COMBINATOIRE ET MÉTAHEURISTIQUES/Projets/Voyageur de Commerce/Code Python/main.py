import math
import itertools

# --- 1. Données des villes marocaines ---
villes = {
    "Casablanca": (33.5731, -7.5898),
    "Rabat": (34.0209, -6.8416),
    "Marrakech": (31.6295, -7.9811),
    "Fès": (34.0331, -5.0003),
    "Tanger": (35.7595, -5.8339),
    "Agadir": (30.4278, -9.5981),
    "Oujda": (34.6867, -1.9114),
    "Meknès": (33.8950, -5.5547),
    "Tétouan": (35.5785, -5.3684),
    "El Jadida": (33.2316, -8.5007)
}

# --- 2. Fonction de calcul de distance (Haversine) ---
def distance(coord1, coord2):
    R = 6371  # Rayon de la Terre en km
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c  # Distance en kilomètres

# --- 3. Construction de la matrice de distances ---
distances = {}
for v1 in villes:
    distances[v1] = {}
    for v2 in villes:
        if v1 == v2:
            distances[v1][v2] = 0
        else:
            distances[v1][v2] = round(distance(villes[v1], villes[v2]), 2)

# --- 4. Résolution brute force du TSP ---
def tsp(villes):
    villes_list = list(villes.keys())
    start = villes_list[0]
    autres = villes_list[1:]
    best_path = None
    min_distance = float('inf')

    for perm in itertools.permutations(autres):
        path = [start] + list(perm) + [start]
        total = sum(distances[path[i]][path[i + 1]] for i in range(len(path) - 1))
        if total < min_distance:
            min_distance = total
            best_path = path

    return best_path, min_distance

# --- 5. Exécution ---
chemin, dist_min = tsp(villes)
print("Chemin optimal :", " -> ".join(chemin))
print(f"Distance totale minimale : {dist_min:.2f} km")

