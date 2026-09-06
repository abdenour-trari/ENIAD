from langchain_groq import ChatGroq

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=400
)

response = llm.invoke([
    {"role": "user", "content": "In morocco , what does it mean this name 'chahd'."}
])

print(response.content)