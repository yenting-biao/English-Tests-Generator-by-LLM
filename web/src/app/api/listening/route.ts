import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { privateEnv } from "@/lib/validators/env";
import { Message } from "@/lib/types/message";
import { questionTypesDesciprtion } from "@/lib/constants/questionTypes";

// ref: https://github.com/fent/node-ytdl-core/issues/932#issuecomment-2233405812
import ytdl from "@distube/ytdl-core";
import fs from "fs";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: privateEnv.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const url = data.url; // "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const info = await ytdl.getBasicInfo(url);
  const id = info.videoDetails.videoId;
  console.log("id", id);
  const filename = `./audio/{id}.m4a`;

  try {
    await new Promise((resolve, reject) => {
      // wait
      ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          },
        },
      })
        .on("progress", (chunkLength, downloaded, total) => {
          console.log("percent", downloaded / total);
        })
        .on("error", reject)
        .pipe(fs.createWriteStream(filename))
        .on("close", resolve);
    });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ status: 500 });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filename),
      model: "whisper-1",
      response_format: "text",
    });

    console.log(transcription);
    return NextResponse.json({ status: 200, transcription });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ status: 500 });
  }
}
