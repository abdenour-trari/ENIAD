from pettingzoo.butterfly import pistonball_v6

# Initialisation d’un environnement multi - agents
env = pistonball_v6.env ( render_mode="human")
env.reset ()

for agent in env . agent_iter () :
    observation, reward, termination, truncation, info = env.last ()

if termination or truncation :
    action = None
else :
    # L’agent choisit une action aleatoire
    action = env.action_space(agent).sample()

env.step ( action )
env.close ()