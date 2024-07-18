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

    instruction = """
    Generate a reading comprehension question. The difficulty level should be CEFR C1. The passage should be around 400 words long, containing 3 to 4 paragraphs. There should be 4 multiple choice questions, each with 4 answer choices. **Note that the answers should be plausible**. The questions should be based on the passage. I will give you some examples of reading comprehension questions. Please generate a reading comprehension question whose difficulty is similar to the examples, but the passage and questions should be different. The question types should be similar to the examples. Please also give the answers in the end. **Note that the question choices should be PLAUSIBLE**, so that students need to read very carefully to obtain the correct answer. The description of the choices should be in other words rather than directly the same with the sentences in the passage. The choices for the question should also be misleading and attract students to choose the wrong option. **The questions should be TRICKY.** 
    Below are some examples, please learn from them carefully:\n\n
    """

    questionsType = """
    Moreover, the question should including the following types but not limited to: 1. The main idea of the passage. 2. Facts or non-facts about the details of the passage. 3. Inferences from the passage. 4. The meaning of difficult words in the passage, which should be in academic word list. 
    """

    outputFormat = """
    Above are the examples. I believe that you are now a master of generating reading comprehension questions. Please generate a reading comprehension question whose quality is similar to the examples. Please output the reading comprehension question in the following format:
    
    Passage: 
    [The passage you generated]
    
    Question: 
    1. [Question 1 Description]
    (A) [Choice A]
    (B) [Choice B]
    (C) [Choice C]
    (D) [Choice D]
    2. [Question 2 Description]
    (A) [Choice A]
    (B) [Choice B]
    (C) [Choice C]
    (D) [Choice D]
    3. [Question 3 Description]
    (A) [Choice A]
    (B) [Choice B]
    (C) [Choice C]
    (D) [Choice D]
    4. [Question 4 Description]
    (A) [Choice A]
    (B) [Choice B]
    (C) [Choice C]
    (D) [Choice D]
    
    Answers:
    1. [Answer 1]
    2. [Answer 2]
    3. [Answer 3]
    4. [Answer 4]
    """

    prompt = (
        instruction + "\n".join(examples) + "\n" + questionsType + "\n" + outputFormat
    )
    client = openai.Client(api_key=OPENAI_API_KEY)
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an English teacher at University, skilled in generating reading comprehension questions designed for college students, whose expected English ability is CEFR C1",
            },
            {
                "role": "user",
                "content": prompt,
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
