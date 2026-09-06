class SimpleNode:
    def __init__(self, name, func):
        self.name = name
        self.func = func
        self.next_node = None

    def run(self, context):
        result = self.func(context)
        if self.next_node:
            return self.next_node.run(context)
        return result

class SimpleGraph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, node):
        self.nodes[node.name] = node

    def connect(self, from_name, to_name):
        self.nodes[from_name].next_node = self.nodes[to_name]

    def run(self, start_name, context):
        return self.nodes[start_name].run(context)

def start_node(context):
    return "Bienvenue dans le chatbot simple ! Posez une question."

def reply_node(context):
    user_input = context.get('user_input', '').lower()
    if "appel d'offre" in user_input or "appel-offre" in user_input:
        return "Je peux vous aider à chercher des appels d'offres. Utilisez la recherche ci-dessus."
    elif "bonjour" in user_input or "salut" in user_input:
        return "Bonjour! Comment puis-je vous aider aujourd'hui ?"
    else:
        return "Désolé, je n’ai pas compris. Peux-tu reformuler ?"

graph = SimpleGraph()
graph.add_node(SimpleNode("start", start_node))
graph.add_node(SimpleNode("reply", reply_node))
graph.connect("start", "reply")
