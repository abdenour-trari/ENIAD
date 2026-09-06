def build_prompt(text, examples):
    prompt = """
You are a sentiment analysis model.

Examples:
"""

    for _, row in examples.iterrows():
        prompt += f"""
Review: {row['text']}
Sentiment: {row['label_text']}
"""

    prompt += f"""
Now classify:

Review: {text}

Answer:
"""
    return prompt