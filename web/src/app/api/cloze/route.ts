import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { clozeTestSchema } from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { db } from "@/db";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: privateEnv.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  let difficulty, numQuestions, numOptions, examples;
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
      You are an English teacher skilled in designing cloze tests for English learners at various proficiency levels. A cloze test involves a passage with certain words removed, requiring students to fill in the blanks with appropriate words. For each blank, you should underline the blank and put a serial number in the middle of the blank, and provide multiple options for students to choose from. 
      There are many ways to generate cloze tests, but the most common way is to use a passage from a book, article, or other text and remove certain words. It is also important to know what words should be removed in a passage so that it could be used to assess the student's cloze test skills. The removed words can be used to test the student's vocabulary and grammar skills. 
      1. For the grammar part, you can test the student's knowledge of passive sentences, relative clauses, participle clauses, and other grammar points, for example, the options can be different verb tenses, like present simple, present continuous, past simple, past continuous, etc. Below is an example of a cloze test question of the grammar part:
      <Example>
      "They are chunks of rock or metal that speed through space. Some are very large and may be hundreds of feet wide. Others ____ the size of a small stone."
      (A) may be (B) would be (C) must have been (D) could have been
      </Example>
      2. For the vocabulary part, you can test the student's knowledge of synonyms, antonyms, collocations, and other vocabulary points.  Note that a blank can be a single word or multiple words.

      You will be asked to generate a cloze test based on specific requirements provided by the user, including the difficulty level, number of blanks, number of options and other relevant criteria.

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
      
      To ensure an effective cloze test, it should be challenging and meet the following criteria:

      1. **Contextual coherence**: The passage should remain coherent and meaningful even with the blanks, enabling students to infer the missing words from the context.
      2. **Variety of blanks**: The removed words should include a mix of parts of speech (e.g., vocabulary, phrases, conjunctions, grammar, etc) to assess a range of language skills. Each cloze test should contain at least one grammar-related blank and one vocabulary-related blank. The grammar-related blank should test the student's knowledge of grammar rules, like verb tense or active/passive voice. The vocabulary-related blank should test the student's knowledge of synonyms, antonyms, collocations, etc.
      3. **Appropriate difficulty**: The number and complexity of the blanks should match the CEFR level specified by the user.
      4. **Misleading incorrect choices:** The incorrect options should be designed to mislead and attract students, making the question more difficult.
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
      model: openai("gpt-4o-mini"),
      messages: messages,
      maxTokens: 4096,
      temperature: 0.3,
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

  return `
  Please generate a cloze test with the following requirement:
  1. The overall difficulty level is CEFR ${difficultyStr}.
  2. There should be ${numQuestions} blanks, each with ${numOptions} answer choices. Note that a blank can contain a single word or multiple words.
  3. The passage should only have one paragraph and within 200 words.
  
  I will give you some examples of cloze test questions. Please generate cloze test questions whose difficulty is similar to the examples. Moreover, please also give the answers in the end. 
  Below are some examples, please learn from them carefully:\n\n
  
  ${examples}

  Above are the examples. I believe that you are now a master of generating cloze tests.  Please generate a cloze test whose quality and question types are similar to the examples, and satisfy the 2 requirements I mentioned above before the examples. You should also ensure that all answer choices are plausible, and include misleading incorrect options. The questions should be specific and test the student's understanding and critical thinking skills. The blanks (or say questions) should contain at least one grammar problems. Below is an example:
  <Example>
  "They are chunks of rock or metal that speed through space. Some are very large and may be hundreds of feet wide. Others __(1)__ the size of a small stone."
  (A) may be (B) would be (C) must have been (D) could have been
  </Example>
  
  Please generate a cloze test with ${numQuestions} blanks (note that the blanks should look like this: __(number)__), each with ${numOptions} options, and output each cloze test in the following format (note that the words in the brackets, "[" and "]", are placeholders and should be replaced with the actual content):
    
  Cloze Test:
  [The passage with blanks]
  Questions: 
  1. (A) [Choice A] (B) [Choice B] ...(Other choices)
  2. (A) [Choice A] (B) [Choice B] ...(Other choices and questions)
  
  Answers:
  1. ([Answer 1])
  2. ([Answer 2])
  ...(Other answers)
  `;
}

/**
We all know that too much stress is not good for our health, but too little is not ideal, either.
While 11 stress can be dangerous to the body, short-term stress is actually healthy.
Short-term stress triggers the production of protective chemicals in our body and strengthens the
body’s defenses. 12 our body is in a vulnerable situation, a burst of stress will quickly mobilize the
body’s own repair system to defend the damaged areas. This 13 us from physical discomfort and
sickness. Small amounts of stress hormones may even sharpen our memory. A recent study found that
when rats were forced to swim—an activity that places them under stress for a short while—they
remembered their way through mazes far 14 than rats that were in a relaxed state.
The key to a healthy lifestyle is to keep our stress level 15 . Too much stress will make us
cranky and sick. Too little stress, on the other hand, will lead to boredom and low motivation.
11. (A) contagious (B) chronic (C) diagnostic (D) tedious
12. (A) Till (B) Unless (C) When (D) Whereas
13. (A) conceals (B) derives (C) shields (D) transforms
14. (A) harder (B) better (C) less (D) further
15. (A) balanced (B) balancing (C) balances (D) to balance

Do you know the difference between the terms meteoroid, meteor, and meteorite in astronomy?
Many people find these words confusing. However, the difference is all about their 16 .
Meteoroids are far up in the sky. They are chunks of rock or metal that speed through space. Some
are very large and may be hundreds of feet wide. Others 17 the size of a small stone. Most
meteoroids travel around the sun in space and stay away from the Earth. However, sometimes a meteoroid
will enter the Earth’s atmosphere. Friction with the atmosphere will cause it to 18 and burn while
traveling at high speed. As a meteoroid begins to burn in the atmosphere, it leaves a streak of light. When
this tail-like light is falling down toward the Earth, it is called a meteor, or a shooting star. Most meteors
vaporize completely before they hit the ground. If any meteor 19 its fiery journey through the
atmosphere and lands on Earth, it is called a meteorite. Large meteorites can cause great explosions and
much destruction on the surface of the Earth. 20 , Barringer Crater in the American state of Arizona,
measuring 1,200 m in diameter and some 170 m deep, was produced by a meteorite impact.
16. (A) size (B) weight (C) location (D) temperature
17. (A) may be (B) would be (C) must have been (D) could have been
18. (A) wear out (B) turn off (C) break through (D) heat up
19. (A) approaches (B) survives (C) confirms (D) targets
20. (A) Indeed (B) Nevertheless (C) For example (D) In short
 */
