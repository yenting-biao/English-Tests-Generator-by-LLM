import { NextRequest, NextResponse } from "next/server";
import { genQASchema } from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { questionTypes as typesString } from "@/lib/constants/questionTypes";

export const maxDuration = 120;

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
    const validatedData = genQASchema.parse(data);
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

  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are an English teacher skilled in designing reading comprehension problems for English learners with different levels. A reading comprehension problem contains passages and some questions based on the passage. You will be asked to generate a reading comprehension question based on the given requirements.
      
      A good reading comprehension problem should be **TRICKY** and satisfy the following requirements:
      1. **The question choices should be PLAUSIBLE**, so that students need to read very carefully to obtain the correct answer. 
      2. The description of the choices should be **in other words** rather than directly the same with the sentences in the passage. 
      3. The choices that are not the correct answer for the question should also be misleading and attract students to choose.
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

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: messages,
      maxTokens: 2048,
      temperature: 0.5,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.log("API has some problems:", error);
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
    .map((val) => typesString[val])
    .join(", ");
  console.log("questionTypeFormatStr", questionTypeFormatStr);

  return `
  Please generate a reading comprehension question with the following requirement:
  1. The overall difficulty level is ${difficultyStr}. (The Common European Framework of Reference for Languages (CEFR) is an international standard for describing language ability. It describes language ability on a six-point scale, from A1 for beginners, up to C2 for those who have mastered a language.) 
  2. The passage is around ${passageLength} words long, containing 3 to 5 paragraphs. 
  3. ${
    topic
      ? `The topic of the passage should be one of the following topics: ${topic}.`
      : "The topic of the passage is not limited, but it should be appropriate."
  } 
  4. There should be ${numQuestions} multiple choice questions, each with ${numOptions} answer choices. 
  5. ${
    questionTypes.length > 0
      ? `The questions should contain the following types but not limited to: ${questionTypeFormatStr}.`
      : "The questions should contain different types of questions."
  }
  I will give you some examples of reading comprehension questions. Please generate a reading comprehension question whose difficulty is similar to the examples, but the passage and questions should be different. Moreover, please also give the answers in the end. 
  Below are some examples, please learn from them carefully:\n\n
  
  ${examples}

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
  `;
}
