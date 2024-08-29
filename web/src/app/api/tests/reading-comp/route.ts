import { db } from "@/db";
import {
  multipleChoiceQuestionTable,
  optionsTable,
  readingTestTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { saveReadingCompResultSchema } from "@/lib/validators/genQA";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;
  if (!user || user.username !== privateEnv.ADMIN_USERNAME) {
    return NextResponse.json(
      { error: "You are not authorized to access this resource." },
      { status: 403 }
    );
  }

  const data = await req.json();
  const validatedData = saveReadingCompResultSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Validation error: ", validatedData.error);
    return NextResponse.json(
      { error: "We cannot validate your request." },
      { status: 400 }
    );
  }

  // save the data to the database
  const { passage, questions, title } = validatedData.data;
  let testId = "";
  try {
    await db.transaction(async (trx) => {
      let [res] = await trx
        .insert(readingTestTable)
        .values({
          creatorId: user.id,
          title: title,
          passage: passage,
        })
        .$returningId()
        .execute();
      testId = res.id;

      for (const question of questions) {
        [res] = await trx
          .insert(multipleChoiceQuestionTable)
          .values({
            readingTestId: testId,
            description: question.question,
          })
          .$returningId()
          .execute();
        const questionId = res.id;

        for (const option of question.options) {
          await trx
            .insert(optionsTable)
            .values({
              questionId: questionId,
              option: option.option,
              isCorrect: option.correct,
            })
            .execute();
        }
      }
    });
  } catch (error) {
    console.error("Error saving reading comp test: ", error);
    return NextResponse.json(
      { error: "We cannot save your data." },
      { status: 500 }
    );
  }

  return NextResponse.json({ testId: testId }, { status: 200 });
}
