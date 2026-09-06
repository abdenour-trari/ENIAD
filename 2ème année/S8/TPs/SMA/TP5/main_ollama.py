from langchain_ollama import ChatOllama

llm = ChatOllama(model="qwen:latest")

response = llm.invoke([
    {"role": "user", "content": "Donner moi des places Populaires dans la ville Oujda ."}
])

print(response.content)