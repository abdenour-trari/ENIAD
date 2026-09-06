def build_prompt(text):
    return f"""
You are a sentiment analysis model.

Classify the sentiment of the following review as:
- positive
- negative

Review:
{text}

Answer with only one word (positive or negative):
"""