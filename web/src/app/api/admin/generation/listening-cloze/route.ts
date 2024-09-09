import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { listeningClozeSchema } from "@/lib/validators/genQA";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { db } from "@/db";
import { listeningClozeGenResultTable } from "@/db/schema";
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
  console.log("Number of blanks:", numBlanks);

  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are an English expert. You are good at finding the most important and difficult words or phrases in a transcript.

      You should output the transcript with these important and difficult words or phrases replaced by blanks, and number the blanks like this: \`__(blank number)__\`. However, you should not choose the same word or phrase multiple times. You should not choose proper nouns, including names, places, companies, and so on.
      Also, you should output these words or phrases below the transcript.
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
        await db
          .insert(listeningClozeGenResultTable)
          .values({
            numBlanks: numBlanks,
            transcript: String(transcript),
            generatedResult: param.text,
          })
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
  Please find the top ${numBlanks} most important and difficult words or phrases in the following transcript, and output in the desired format.
  ${transcript}
  `;
}
