import gymnasium as gym
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
import matplotlib.pyplot as plt


# ---------------------------------------------------
# 1) Définition du réseau Deep Q-Network (DQN)
# ---------------------------------------------------
class DQN(nn.Module):
    def __init__(self, n_observations, n_actions):
        super(DQN, self).__init__()

        # L'état dans Taxi-v3 est un entier entre 0 et 499
        # On utilise Embedding pour transformer cet entier
        # en vecteur dense de taille 32
        self.embedding = nn.Embedding(n_observations, 32)

        # Couche cachée
        self.fc1 = nn.Linear(32, 64)

        # Couche de sortie :
        # retourne une Q-value pour chaque action possible
        self.fc2 = nn.Linear(64, n_actions)

    def forward(self, x):
        # Transformation de l'état en vecteur dense
        x = self.embedding(x)

        # Activation ReLU
        x = torch.relu(self.fc1(x))

        # Sortie finale
        x = self.fc2(x)

        return x


# ---------------------------------------------------
# 2) Création de l’environnement Taxi-v3
# ---------------------------------------------------
env = gym.make("Taxi-v3")

# Nombre total d'états = 500
n_states = env.observation_space.n

# Nombre total d'actions = 6
n_actions = env.action_space.n

print("Nombre d'états :", n_states)
print("Nombre d'actions :", n_actions)


# ---------------------------------------------------
# 3) Création du réseau principal (Policy Network)
# ---------------------------------------------------
policy_net = DQN(n_states, n_actions)

# Optimiseur
optimizer = optim.Adam(
    policy_net.parameters(),
    lr=1e-3
)

# Fonction de perte
loss_fn = nn.MSELoss()


print("\nRéseau créé avec succès :")
print(policy_net)