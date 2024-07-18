import { NextRequest, NextResponse } from "next/server";
import { genQASchema } from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const data = await req.json();
  let difficulty, passageLength, topic, numQuestions, numOptions, examples;
  try {
    const validatedData = genQASchema.parse(data);
    difficulty = validatedData.difficulty;
    passageLength = validatedData.passageLength;
    topic = validatedData.topic;
    numQuestions = validatedData.numQuestions;
    numOptions = validatedData.numOptions;
    examples = validatedData.examples;
  } catch (error) {
    return NextResponse.json(
      { error: "We cannot validate the request body: " + error },
      { status: 400 }
    );
  }

  const messages: Message[] = [
    { role: "system", content: "" },
    {
      role: "user",
      content: getPrompt(
        difficulty,
        passageLength,
        topic,
        numQuestions,
        numOptions,
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
      model: openai("gpt-4-turbo"),
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
  examples: string
) {
  const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return `
  Generate a reading comprehension question. The difficulty level should be ${
    CEFR[difficulty + 1]
  }. (The Common European Framework of Reference for Languages (CEFR) is an international standard for describing language ability. It describes language ability on a six-point scale, from A1 for beginners, up to C2 for those who have mastered a language.) The passage should be around ${passageLength} words long, containing 3 to 5 paragraphs. ${
    topic && `The topic of the passage should be ${topic}.`
  } There should be ${numQuestions} multiple choice questions, each with ${numOptions} answer choices. 
  **Note that the answers should be plausible**. The questions should be based on the passage. I will give you some examples of reading comprehension questions. Please generate a reading comprehension question whose difficulty is similar to the examples, but the passage and questions should be different. The question types should be similar to the examples. Please also give the answers in the end. **Note that the question choices should be PLAUSIBLE**, so that students need to read very carefully to obtain the correct answer. The description of the choices should be in other words rather than directly the same with the sentences in the passage. The choices for the question should also be misleading and attract students to choose the wrong option. **The questions should be TRICKY.** 
  Below are some examples, please learn from them carefully:\n\n
  
  ${examples}

  Above are the examples. I believe that you are now a master of generating reading comprehension questions. Please generate a reading comprehension question whose quality is similar to the examples. 
  Again, the difficulty level should be ${
    CEFR[difficulty + 1]
  }. (The Common European Framework of Reference for Languages (CEFR) is an international standard for describing language ability. It describes language ability on a six-point scale, from A1 for beginners, up to C2 for those who have mastered a language.) The passage should be around ${passageLength} words long, containing 3 to 5 paragraphs. ${
    topic && `The topic of the passage should be ${topic}.`
  } There should be ${numQuestions} multiple choice questions, each with ${numOptions} answer choices. 
  
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
