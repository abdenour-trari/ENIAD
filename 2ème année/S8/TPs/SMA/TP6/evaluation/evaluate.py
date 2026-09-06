from sklearn.metrics import accuracy_score, f1_score
from tqdm import tqdm

def evaluate(model_fn, prompt_fn, test_df, examples=None, sample_size=100):
    y_true = []
    y_pred = []

    sample = test_df.sample(sample_size, random_state=42)

    for _, row in tqdm(sample.iterrows(), total=sample_size):
        text = row["text"]
        true_label = row["label_text"]

        if examples is not None:
            prompt = prompt_fn(text, examples)
        else:
            prompt = prompt_fn(text)

        pred = model_fn(prompt)

        if "positive" in pred:
            pred = "positive"
        elif "negative" in pred:
            pred = "negative"
        else:
            pred = "negative"

        y_true.append(true_label)
        y_pred.append(pred)

    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, pos_label="positive")

    return acc, f1