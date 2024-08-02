import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { listeningClozeSchema } from "@/lib/validators/genQA";
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
  const formData = await req.formData();
  const data = Object.fromEntries(formData.entries());
  let numBlanks, audioFile, transcript;
  try {
    const validatedData = listeningClozeSchema.parse(data);
    numBlanks = Number(validatedData.numBlanks);
    audioFile = validatedData.audioFile;
    transcript = validatedData.transcript;
    if (audioFile === undefined && transcript === "") {
      return NextResponse.json(
        { error: "Please provide either an audio file or a transcript." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error validating request body:", error);
    return NextResponse.json(
      { error: "We cannot validate the request body" },
      { status: 400 }
    );
  }

  if (transcript === undefined || transcript === "") {
    transcript = await getTranscription(audioFile);
  }
  console.log("Transcription:\n", transcript);

  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are an English teacher skilled in designing listening cloze tests for English learners at various proficiency levels. A listening cloze test involves a passage with certain words removed, requiring students to fill in the blanks with the words they listen in the audio. For each blank, you should underline the blank and put a serial number in the middle of the blank, and provide multiple options for students to choose from.
      You will be given a passage of text and the number of blanks. Please choose the appropriate words to remove from the passage so that the blanks are challenging to evaluate the students' listening skills. 
      
      To ensure an effective cloze test, it should be challenging and meet the following criteria:

      1. **Contextual coherence**: The passage should remain coherent and meaningful even with the blanks, enabling students to infer the missing words from the context.
      2. **Variety of blanks**: The removed words should include a mix of parts of speech (e.g., vocabulary, phrases, conjunctions, grammar, etc) to assess a range of language skills.
      `,
    },
    {
      role: "user",
      content: getPrompt(numBlanks, transcript),
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

async function getTranscription(audioFile: File) {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "text",
    language: "en",
  });

  return transcription;
}

function getPrompt(
  numBlanks: number,
  transcript: string | OpenAI.Audio.Transcriptions.Transcription
) {
  return `
  Please generate a cloze test of the given passage with ${numBlanks} blanks (note that the blanks should look like this: __(number)__), and output each cloze test in the following format (note that the words in the brackets, "[" and "]", are placeholders and should be replaced with the actual content):
    
  Cloze Test:
  [The passage with blanks]
  
  Answers:
  1. ([Answer 1])
  2. ([Answer 2])
  ...(Other answers)

  Below is the passage, please remove ${numBlanks} meaningful and challenging words from the passage:
  ${transcript}
  `;
}
