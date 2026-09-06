# Explication du Rôle : `ai_engine.py`

Le fichier `ai_engine.py` agit comme le **moteur d'analyse IA** de la plateforme Nesture AI. Son rôle principal est d'analyser les données collectées pendant qu'un enfant (l'apprenant) joue à une session de jeu, et de traduire ces données brutes en informations cliniques et en recommandations utiles pour les ergothérapeutes (OT) et les parents.

Voici une explication détaillée de ses responsabilités principales :

## 1. Détection des réflexes primitifs (`ReflexRule` & `REFLEX_RULES`)
Le fichier contient des règles définies pour différents réflexes primitifs (comme Moro, ATNR, STNR, TLR, Spinal Galant, Palmar Grasp). Pour chaque réflexe, il définit :
- **L'impact** (ex: difficulté à croiser la ligne médiane pour l'ATNR).
- **Les indicateurs comportementaux dans le jeu** (ex: évitement du centre de l'écran, asymétrie gauche/droite).
- **Les exercices recommandés** si ce réflexe est détecté (ex: "ex-004").

## 2. Calcul des métriques de la session (`_calculate_metrics`)
À la fin d'une session de jeu, ce fichier prend les données de la session et des gestes en main (nombre d'essais, prises parfaites, temps de réponse, fatigue, lissage de la trajectoire de la main, etc.) et normalise ces métriques sous forme de pourcentages ou d'indices (comme le taux d'échec ou l'`avg_head_hand_coupling`).

## 3. Calcul du score des réflexes (`_score_reflexes`)
Basé sur les indicateurs détectés lors du jeu, le moteur calcule un **score d'intégration de 0 à 100** pour chaque réflexe :
- Un score élevé (proche de 100) signifie que le réflexe est bien intégré (ce qui est positif).
- Un score plus bas s'applique en cas de pénalité (précision faible, temps de réponse lent, mouvement saccadé), indiquant un possible maintien anormal du réflexe.
- Il associe également un **niveau de confiance** (Élevé, Moyen, Faible) à cette détection.

## 4. Génération de Recommandations (`_generate_recommendations`)
En fonction des scores de réflexes et des problèmes majeurs détectés (niveaux de confiance Élevé ou Moyen), l'algorithme génère automatiquement 3 à 5 recommandations d'exercices ciblés (ex: jeux ou exercices physiques spécifiques) pour aider l'enfant à progresser de manière concrète.

## 5. Génération d'un résumé narratif (`_generate_narrative`)
L'IA rédige automatiquement un petit texte résumé adapté aux parents et thérapeutes. Le ton du message varie selon les performances de la session (excellent, bon ou nécessite de l'attention) et met en avant les réflexes spécifiques sur lesquels la thérapie devra se concentrer.

## 6. LPI : Indice de progression de l'apprenant (`_calculate_lpi`)
Le système calcule un score global appelé **LPI (Learner Progress Index)**. Ce score de 0 à 100 est un mélange de :
- La précision de l'enfant (40%)
- Sa vitesse (25%)
- La fluidité de ses mouvements (20%)
- Le score moyen d'intégration de ses réflexes (15%)

---

**En résumé :** C'est le "vrai cerveau" de l'application qui convertit de simples clics et mouvements de main (gestes du jeu) en un bilan neurologique structuré. Il calcule des scores, effectue un diagnostic des réflexes non intégrés, et prescrit automatiquement des exercices adaptés. Actuellement, c'est un système "basé sur des règles" classiques, mais il a été conçu pour être facilement remplacé par un modèle de Machine Learning entraîné à l'avenir.
