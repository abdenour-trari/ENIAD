import gymnasium as gym

# Creattion de l'environnement
env = gym.make("CartPole-v1" , render_mode="human")
observation, info = env.reset()
score_totale = 0

print("tappez 0 pour aller a gauche et 1 pour aller a droite")

# Affichage des espaces
print(f"espace d'action : {env.action_space}")
print(f"espace d'observation : {env.observation_space}")


# boucle de simulation aleatoire
while True:
    try:
        user_input = input("Entrez votre action (0 ou 1) : ")
        if user_input == 's':
            break
        action = int(user_input)
        if action not in [0, 1]:
            print("Action invalide. Veuillez entrer 0 ou 1.")
            continue

        observation, reward, terminated, truncated, info = env.step(action)
        score_totale += reward
        print(f" {terminated}")

        if terminated or truncated:
            print ( f"Score realise manuellement : { score_totale}")
            break
    except ValueError:
        print (" Veuillez entrer un nombre entier .")

env.close()
