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

    difficultyStr = "B1"
    passageLength = 300
    topic = None
    numQuestions = 4
    numOptions = 4
    questionTypes = [0, 1, 2, 3]
    questionTypeFormatStr = """
    Main idea: the main point of the passage.
    Fact or event based questions (detail questions): questions that ask about specific details or events in the passage.
    Inference questions: questions that ask about information that is not directly stated in the passage.
    Vocabulary questions: questions that ask about the meaning of difficult words in the passage.
    """
    questionTypeDescriptionInPrompt = (
        f"The questions should contain the following types but not limited to:{questionTypeFormatStr}."
        if questionTypes
        else "The questions should contain different types of questions."
    )
    examplesString = "\n".join(examples)

    prompt = f"""
    Please generate a reading comprehension question with the following requirement:
    1. The overall difficulty level is CEFR {difficultyStr}.
    2. The passage is around {passageLength} words long, containing 3 to 5 paragraphs. 
    3. {
        f"The topic of the passage should be one of the following topics: {topic}." if topic else
        "The topic of the passage is not limited, but it should be appropriate."
    } 
    4. There should be {numQuestions} multiple choice questions, each with {numOptions} answer choices. 
    5. {questionTypeDescriptionInPrompt}
    
    I will give you some examples of reading comprehension questions. Please generate a reading comprehension question whose difficulty is similar to the examples, but the passage and questions should be different. Moreover, please also give the answers in the end. 
    Below are some examples, please learn from them carefully:
    
    {examplesString}

    Above are the examples. I believe that you are now a master of generating reading comprehension questions. Please generate a reading comprehension question whose quality is similar to the examples, and satisfy the 5 requirements I mentioned above before the examples.
    
    Please output the reading comprehension question in the following format:
        
    Passage: 
    [The passage you generated]
    
    Question: 
    1. [Question 1 Description]
    (A) [Choice A]
    (B) [Choice B]
    ...(Other choices and questions)
    
    Answers:
    1. [Answer 1]
    2. [Answer 2]
    ...(Other answers)
    """

    client = openai.Client(api_key=OPENAI_API_KEY)
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
                You are an English teacher skilled in designing reading comprehension problems for English learners with different levels. A reading comprehension problem contains passages and some questions based on the passage. You will be asked to generate a reading comprehension question based on the given requirements, including difficulty, passage length, topic, number of questions, number of options, question types, etc.

                Among the requirements, the difficulty level is based on the Common European Framework of Reference for Languages (CEFR). CEFR is a guideline used to describe achievements of learners of foreign languages across Europe and, increasingly, in other countries. CEFR divides learners into three broad divisions that can each be further divided into two levels; for each level, it describes what a learner is supposed to be able to do in reading, listening, speaking and writing. The following discription indicates these levels:
                - A: Basic user
                    - A1: Breakthrough:
                    - Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type.
                    - Can introduce themselves to others and can ask and answer questions about personal details such as where they live, people they know and things they have.
                    - Can interact in a simple way provided the other person talks slowly and clearly and is prepared to help.
                    - A2: Waystage
                    - Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment).
                    - Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.
                    - Can describe in simple terms aspects of their background, immediate environment and matters in areas of immediate need.
                - B: Independent user
                    - B1: Threshold
                    - Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.
                    - Can deal with most situations likely to arise while travelling in an area where the language is spoken.
                    - Can produce simple connected text on topics that are familiar or of personal interest.
                    - Can describe experiences and events, dreams, hopes and ambitions and briefly give reasons and explanations for opinions and plans.
                    - B2: Vantage
                    - Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialisation.
                    - Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.
                    - Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.
                - C: Proficient user
                    - C1: Advanced
                    - Can understand a wide range of demanding, longer clauses and recognise implicit meaning.
                    - Can express ideas fluently and spontaneously without much obvious searching for expressions.
                    - Can use language flexibly and effectively for social, academic and professional purposes.
                    - Can produce clear, well-structured, detailed text on complex subjects, showing controlled use of organisational patterns, connectors and cohesive devices.
                    - C2: Mastery
                    - Can understand with ease virtually everything heard or read.
                    - Can summarise information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation.
                    - Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning even in the most complex situations.
                
                To ensure a reading comprehension problem is effective, it should be **challenging** and meet the following criteria:
                1. **Plausible question choices:** The answer options should seem reasonable, requiring students to read carefully to identify the correct one.
                2. **Paraphrased choices:** The descriptions of the choices should be rephrased rather than directly mirroring the sentences in the passage.
                3. **Misleading incorrect choices:** The incorrect options should be designed to mislead and attract students, making the question more difficult.
                """,
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


if __name__ == "__main__":
    main()
