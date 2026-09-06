from data.prepare_data import load_imdb, get_few_shot_examples
from prompts import zero_shot, few_shot, cot
from evaluation.evaluate import evaluate
from utils.openai_client import query_llm

def run():
    train_df, test_df = load_imdb()

    # Few-shot examples
    examples = get_few_shot_examples(train_df)

    print("===== ZERO SHOT =====")
    acc, f1 = evaluate(query_llm, zero_shot.build_prompt, test_df)
    print("Accuracy:", acc, "F1:", f1)

    print("\n===== FEW SHOT =====")
    acc, f1 = evaluate(query_llm, few_shot.build_prompt, test_df, examples)
    print("Accuracy:", acc, "F1:", f1)

    print("\n===== CHAIN OF THOUGHT =====")
    acc, f1 = evaluate(query_llm, cot.build_prompt, test_df, examples)
    print("Accuracy:", acc, "F1:", f1)

if __name__ == "__main__":
    run()