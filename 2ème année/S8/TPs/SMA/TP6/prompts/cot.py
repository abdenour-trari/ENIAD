def build_prompt(text, examples):
    prompt = """
You are a sentiment analysis expert.

Analyze carefully step by step before answering.

Examples:
"""

    for _, row in examples.iterrows():
        prompt += f"""
Review: {row['text']}
Reasoning: The sentiment is {row['label_text']} because of the tone.
Answer: {row['label_text']}
"""

    prompt += f"""
Now analyze:

Review: {text}

Let's think step by step.
Final answer (positive/negative):
"""
    return prompt