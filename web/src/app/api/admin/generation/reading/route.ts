import { NextRequest, NextResponse } from "next/server";
import {
  readingComprehensionSchema,
  readingCompResultSchema,
} from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { questionTypesDesciprtion } from "@/lib/constants/questionTypes";
// import { db } from "@/db";
// import { readingQuestionTypesTable, readingGenResultTable } from "@/db/schema";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const data = await req.json();
  let difficulty,
    passageLength,
    topic,
    numQuestions,
    numOptions,
    questionTypes,
    examples;
  try {
    const validatedData = readingComprehensionSchema.parse(data);
    difficulty = validatedData.difficulty;
    passageLength = validatedData.passageLength;
    topic = validatedData.topic;
    numQuestions = validatedData.numQuestions;
    numOptions = validatedData.numOptions;
    questionTypes = validatedData.questionTypes;
    examples = validatedData.examples;
  } catch (error) {
    console.log("Error validating request body:", error);
    return NextResponse.json(
      { error: "We cannot validate the request body" },
      { status: 400 }
    );
  }

  // Reference: https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages
  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are an English teacher skilled in designing reading comprehension problems for English learners with different levels. A reading comprehension problem contains a passage and some questions based on the passage. You will be asked to generate a reading comprehension question based on the requirements given by the user, including number of passages to be generated, difficulty, passage length, topic, number of questions, number of options, question types, etc.

      Among the requirements, the difficulty level is based on the Common European Framework of Reference for Languages (CEFR). The passage and question you generate should fit the criterion of CEFR given by the user. CEFR is a guideline used to describe achievements of learners of foreign languages across Europe and, increasingly, in other countries. CEFR divides learners into three broad divisions that can each be further divided into two levels; for each level, it describes what a learner is supposed to be able to do in reading, listening, speaking and writing. The following discription indicates these levels:
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
      4. **Specific and Detailed Question:** Frame the question to require a detailed understanding of the passage. Ask about specific facts, events, or arguments presented in the text, rather than general ideas.
      5. **Evenly Distributed Correct Answers:** Ensure that the correct answer is not always the same letter (e.g., "B" is not always the correct answer).
      `,
    },
    {
      role: "user",
      content: getPrompt(
        difficulty,
        passageLength,
        topic,
        numQuestions,
        numOptions,
        questionTypes,
        examples
      ),
    },
  ];

  try {
    const openai = createOpenAI({
      apiKey: privateEnv.OPENAI_API_KEY,
      compatibility: "strict",
    });

    const objectResult = await streamObject({
      model: openai("gpt-4o-mini"),
      messages: messages,
      maxTokens: 8192,
      temperature: 0.3,
      schema: readingCompResultSchema,
      onFinish: async (param) => {
        if (param.error) {
          console.log(
            "Error in generating reading comprehension questions:",
            param.error
          );
          return;
        } else {
          // console.log(
          //   "Success in generating reading comprehension questions:",
          //   param.object
          // );
          if (!param.object) {
            console.error("No object returned from the model");
            return;
          }
        }
      },
    });

    return objectResult.toTextStreamResponse();

    // const result = await streamText({
    //   model: openai("gpt-4o-mini"),
    //   messages: messages,
    //   maxTokens: 8192,
    //   temperature: 0.3,
    //   onFinish: async (param) => {
    //     const ret = await db
    //       .insert(readingGenResultTable)
    //       .values({
    //         difficulty: difficulty,
    //         numQuestions: numQuestions,
    //         numOptions: numOptions,
    //         numPassages: numPassages,
    //         passageLength: passageLength,
    //         topic: topic ?? "",
    //         examples: examples,
    //         generatedResult: param.text,
    //       })
    //       .$returningId();

    //     await Promise.all(
    //       questionTypes.map((type) => {
    //         return db.insert(readingQuestionTypesTable).values({
    //           type: type,
    //           generationId: ret[0].id,
    //         });
    //       })
    //     );
    //   },
    // });

    // return result.toTextStreamResponse();
  } catch (error) {
    console.log("API or DB has some problems:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function getPrompt(
  difficulty: number,
  passageLength: number,
  topic: string | undefined,
  numQuestions: number,
  numOptions: number,
  questionTypes: number[],
  examples: string
) {
  const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const difficultyStr = CEFR[difficulty + 1];
  const questionTypeFormatStr = questionTypes
    .map((val) => questionTypesDesciprtion[val])
    .join("\n");
  const randomAnswers = Array.from({ length: numQuestions }, () =>
    Math.floor(Math.random() * numOptions)
  );

  return `
  Please generate a reading comprehension questions with the following requirement:
  1. The overall difficulty level is CEFR ${difficultyStr}.
  2. The passage is around ${passageLength} words long, containing 3 to 5 paragraphs. 
  3. ${
    topic
      ? `The topic of the passage should be one of the following topics: ${topic}.`
      : "The topic of the passage is not limited, but it should be appropriate."
  } 
  4. There should be ${numQuestions} multiple choice questions, each with ${numOptions} options. But only one option is correct. 
  5. ${
    questionTypes.length > 0
      ? `The questions should contain the following types: 
      ${questionTypeFormatStr}.
      `
      : "The questions should contain different types of questions."
  }
  I will give you some examples of reading comprehension questions. Please generate reading comprehension questions whose difficulty is similar to the examples, but the passage and questions should be different. Moreover, please do NOT give the answers in the end, but indicate whether the option is correct or not after each option.
  Below are some examples, please learn from them carefully:\n\n
  
  ${examples}

  Above are the examples. I believe that you are now a master of generating reading comprehension questions.  Please generate reading comprehension questions whose quality is similar to the examples, and satisfy the 5 requirements I mentioned above before the examples. You should also ensure that all answer choices are plausible, paraphrased rather than directly quoted, and include misleading incorrect options. The questions should be specific and test the student's understanding and critical thinking skills.
  
  Please generate a reading comprehension problem with one passage and ${numQuestions} questions, and ${numOptions} options for each question, and output them in the desired json format. The order of options to be marked correct of each questions should be: ${randomAnswers.join(
    ","
  )} (0-based index).
  `;
}
