import { db } from "@/db";
import {
  multipleChoiceQuestionTable,
  optionsTable,
  readingTestTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { saveReadingCompResultSchema } from "@/lib/validators/genQA";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function PUT(
  req: NextRequest,
  { params: { testId } }: { params: { testId: string } }
) {
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

  // update the data to the database
  const { passage, questions, title } = validatedData.data;

  try {
    await db.transaction(async (trx) => {
      await trx
        .update(readingTestTable)
        .set({
          title: title,
          passage: passage,
        })
        .where(eq(readingTestTable.id, testId))
        .execute();

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.id) {
          // insert new question
          const [questionId] = await trx
            .insert(multipleChoiceQuestionTable)
            .values({
              description: question.question,
              readingTestId: testId,
              ind: i,
            })
            .$returningId()
            .execute();
          question.id = questionId.id;
        } else {
          await trx
            .update(multipleChoiceQuestionTable)
            .set({
              description: question.question,
              ind: i,
            })
            .where(eq(multipleChoiceQuestionTable.id, question.id))
            .execute();
        }

        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          if (!option.id) {
            // insert new option
            await trx
              .insert(optionsTable)
              .values({
                option: option.option,
                isCorrect: option.correct,
                questionId: question.id,
                ind: j,
              })
              .execute();
          } else {
            await trx
              .update(optionsTable)
              .set({
                option: option.option,
                isCorrect: option.correct,
                ind: j,
              })
              .where(eq(optionsTable.id, option.id))
              .execute();
          }
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
