from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_llm(prompt):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0.7,
        max_tokens=400,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )

    return response.choices[0].message.content.strip().lower()