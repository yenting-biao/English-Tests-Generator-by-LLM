import { NextRequest, NextResponse } from "next/server";
import { readingCompSchema } from "@/lib/validators/saveTest";
import { db } from "@/db";
import { testsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const data = await req.json();
  const session = await auth();
  if (!session || session.user.username !== "cmgao_llmgentest_admin") {
    return NextResponse.json(
      { error: "You are not authorized to save tests" },
      { status: 403 }
    );
  }
  let title, passage, answers;
  try {
    const validatedData = readingCompSchema.parse(data);
    title = validatedData.title;
    passage = validatedData.passage;
    answers = validatedData.answers;
  } catch (error) {
    console.log("Error validating request body:", error);
    return NextResponse.json(
      { error: "We cannot validate the request body" },
      { status: 400 }
    );
  }
  console.log("title:", title);
  console.log("passage:", passage);
  console.log("answers:", answers);

  // Save the test to the database
  const answerStr = answers.map((answer) => answer.ans).join(",");
  console.log("answerStr:", answerStr);
  try {
    await db.insert(testsTable).values({
      title: title,
      questions: passage,
      answers: answerStr,
      creatorId: session.user.id,
    });
  } catch (error) {
    console.log("Error saving test to the database:", error);
    return NextResponse.json(
      { error: "We cannot save the test to the database" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Test saved successfully" });
}
