from datasets import load_dataset
import pandas as pd

def load_imdb():
    dataset = load_dataset("imdb")

    train_df = pd.DataFrame(dataset["train"])
    test_df = pd.DataFrame(dataset["test"])

    train_df["label_text"] = train_df["label"].apply(lambda x: "positive" if x == 1 else "negative")
    test_df["label_text"] = test_df["label"].apply(lambda x: "positive" if x == 1 else "negative")

    return train_df, test_df


def get_few_shot_examples(df, n=8):
    pos = df[df["label"] == 1].sample(n=n//2, random_state=42)
    neg = df[df["label"] == 0].sample(n=n//2, random_state=42)

    combined = pd.concat([pos, neg])
    return combined.sample(frac=1, random_state=42)