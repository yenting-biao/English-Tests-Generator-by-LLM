import dotenv
import openai


def main():
    try:
        OPENAI_API_KEY = dotenv.dotenv_values()["OPENAI_API_KEY"]
    except KeyError:
        raise ValueError("OPENAI_API_KEY not found in .env file")

    examples = []
    # exampleFiles = ["gsat/113.txt", "gsat/112.txt"]
    exampleFiles = ["ast/110.txt"]
    for file in exampleFiles:
        with open("dataset/" + file, "r") as f:
            examples.append(f.read())

    prompt = "Generate a reading comprehension question. The difficulty level should be CEFR C1. The passage should be around 400 words long, containing 3 to 4 paragraphs. There should be 4 multiple choice questions, each with 4 answer choices. Note that **the answers should be plausible**. The questions should be based on the passage. I will give you some examples of reading comprehension questions. Please generate a reading comprehension question whose difficulty is similar to the examples, but the passage and questions should be different. The question types should be similar to the examples. Please also give the answers in the end. **Note that the question choices should be PLAUSIBLE, so that students need to read very carefully to obtain the correct answer. The choices should be in other words rather than directly the same from the paragraph. The questions should be TRICKY.** Below are some examples, please learn from them carefully:\n\n"

    """
    The question should including the following types but not limited to: 1. The main idea of the passage. 2. Facts or non-facts about the passage. 3. Inferences from the passage. 4. The meaning of difficult words in the passage, which should be in academic word list.
    """

    client = openai.Client(api_key=OPENAI_API_KEY)
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an English teacher at University, skilled in generating reading comprehension questions.",
            },
            {
                "role": "user",
                "content": prompt + "\n".join(examples),
            },
        ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
    print()


if __name__ == "__main__":
    main()
