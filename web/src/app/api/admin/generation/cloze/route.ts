import { NextRequest, NextResponse } from "next/server";
import { clozeTestSchema } from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { db } from "@/db";
import { CEFRDescriptions } from "@/lib/constants/CEFR";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const data = await req.json();
  let difficulty: number, numQuestions: number, numOptions: number, examples;
  try {
    const validatedData = clozeTestSchema.parse(data);
    difficulty = validatedData.difficulty;
    numQuestions = validatedData.numQuestions;
    numOptions = validatedData.numOptions;
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
      You are a language model designed to generate high-quality cloze tests for educational purposes. Ensure the context is coherent and the missing words (with corresponding choices) fit logically within the sentences. Each test should include a short passage with blanks and some multiple-choice options for each blank. 

      Below are some examples of cloze tests, but note that the difficulty level of the examples may not be the same as the difficulty level you are supposed to generate.

      ${
        difficulty <= 1
          ? `**Example Cloze Test:**

        If you cannot live without your car, Zurich might be the last city you would like to visit. In Zurich, people are welcome, but cars are not! Over the past 20 years, this city has used smart ways __(1)__. One is to keep the same total number of parking spaces. For example, if 50 new parking spaces are built in one part of the city, then 50 old spaces in other parts are taken away for other uses. So the total number does not change. Some are unhappy that there are never enough spaces. That is just what the city has in mind: If people find parking more difficult, they will drive less. __(2)__, the total number of cars in the city is counted. Over 3,500 little computers are put under Zurich roads to check the number of cars that enter the city. If the number is higher than the city can deal with, the traffic lights on the roads that enter the city will be kept red. So drivers who are traveling into Zurich have to stop and wait until there are fewer cars in the city. Now, you may wonder __(3)__ . The answer is simple: The city wants to make more space for its people.
        1. (A) to make traffic lighter (B) to invite people to visit
          (C) to make itself a famous city (D) to build more parking spaces
        2. (A) This way (B) However (C) For example (D) Also
        3. (A) why Zurich is doing this (B) what all this has cost Zurich 
          (C) if Zurich should try other ways (D) if Zurich can deal with angry drivers`
          : `
      **Example Cloze Test:**

      Do you know the difference between the terms meteoroid, meteor, and meteorite in astronomy? Many people find these words confusing. However, the difference is all about their __(1)__ . Meteoroids are far up in the sky. They are chunks of rock or metal that speed through space. Some are very large and may be hundreds of feet wide. Others __(2)__ the size of a small stone. Most meteoroids travel around the sun in space and stay away from the Earth. However, sometimes a meteoroid will enter the Earth’s atmosphere. Friction with the atmosphere will cause it to __(3)__ and burn while traveling at high speed. As a meteoroid begins to burn in the atmosphere, it leaves a streak of light. When this tail-like light is falling down toward the Earth, it is called a meteor, or a shooting star. Most meteors vaporize completely before they hit the ground. If any meteor __(4)__ its fiery journey through the atmosphere and lands on Earth, it is called a meteorite. Large meteorites can cause great explosions and much destruction on the surface of the Earth. __(5)__ , Barringer Crater in the American state of Arizona, measuring 1,200 m in diameter and some 170 m deep, was produced by a meteorite impact.
      1. (A) size (B) weight (C) location (D) temperature
      2. (A) may be (B) would be (C) must have been (D) could have been
      3. (A) wear out (B) turn off (C) break through (D) heat up
      4. (A) approaches (B) survives (C) confirms (D) targets
      5. (A) Indeed (B) Nevertheless (C) For example (D) In short
      `
      }

      **Steps to Generate a Cloze Test:**
      1. Understand the requirements of the user, including the difficulty level, number of blanks, number of options, length of the passage, and other relevant criteria.
      2. Generate a complete passage with educational and informative content. The topic can be interesting and engaging. The passage should be around ${
        numQuestions * 20
      } words.
      3. Choose top ${numQuestions} important and challenging vocabulary, phrases, or sentences, but do NOT choose proper nouns, names, places, dates, or other specific information. 
      4. Edit the passage generated in step 2 by replacing the words chosen in step 3 with blanks. Ensure that the remaining passage is coherent and makes sense, and the chosen words are suitable for the students' CEFR level. Check if the passage is challenging but not too difficult. If not, go back to step 3 and choose different words.
      5. Number the blanks from 1 to ${numQuestions}.
      6. For each blank, provide ${numOptions} multiple-choice options, (A, B, C, D, ...)/ Ensure the options are plausible but only one is correct.

      Please ensure the passage is coherent and the options fit logically, maintaining a moderate difficulty level matching the description of the difficulty level given by the user.
      Make sure the cloze test you generate fits the requirements given by the user.
      `,
    },
    {
      role: "user",
      content: getPrompt(difficulty, numQuestions, numOptions, examples),
    },
  ];

  try {
    const openai = createOpenAI({
      apiKey: privateEnv.OPENAI_API_KEY,
      compatibility: "strict",
    });

    const result = await streamText({
      model: openai("gpt-4"),
      messages: messages,
      maxTokens: 1024,
      temperature: 0.5,
      onFinish: async (param) => {
        // const ret = await db
        //   .insert(listeningGenResultTable)
        //   .values({
        //     difficulty: difficulty,
        //     numQuestions: numQuestions,
        //     numOptions: numOptions,
        //     examples: examples,
        //     transcription: String(transcription),
        //     generatedResult: param.text,
        //   })
        //   .returning();
        // await Promise.all(
        //   questionTypes.map((type) => {
        //     return db.insert(listeningQuestionTypesTable).values({
        //       type: type,
        //       generationId: ret[0].id,
        //     });
        //   })
        // );
      },
    });

    return result.toTextStreamResponse();
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
  numQuestions: number,
  numOptions: number,
  examples: string
) {
  const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const difficultyStr = CEFR[difficulty + 1];
  const difficultyDescription =
    difficultyStr in CEFRDescriptions
      ? CEFRDescriptions[difficultyStr]
      : "Unknown";

  return `
  Generate a cloze test with the following requirement:
  1. This cloze test is designed for students with the following CEFR level in English (from A1 as the easiest/beginner level to C2 as the hardest/advanced level):
  ${difficultyDescription}
  2. There should be ${numQuestions} blanks in the passage, each with ${numOptions} answer choices. Note that a blank can contain a single word or multiple words.
  3. The length of the passage should be around ${numQuestions * 20} words.
  
  ${
    examples && examples.length > 0
      ? `Moreover, you can refer to the following examples to generate the cloze test appropriately:
  
  ${examples}`
      : ""
  }

  Make sure the cloze test you generate fits the requirements given by the user. The difficulty should not be too high or too low.

  You should output the cloze test in the following format:
    
  **Cloze Test:**
  [The passage with blanks]

  1. (A) [Choice A] (B) [Choice B] ...(Other choices)
  2. (A) [Choice A] (B) [Choice B] ...(Other choices and questions)
  
  **Answers:**
  1. ([Answer 1])
  2. ([Answer 2])
  ...(Other answers)
  `;
}
