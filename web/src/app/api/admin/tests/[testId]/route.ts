import { NextRequest, NextResponse } from "next/server";
import { readingCompSchema } from "@/lib/validators/saveTest";
import { db } from "@/db";
import { testsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { eq, sql } from "drizzle-orm";

export const maxDuration = 30;

export async function PUT(
  req: NextRequest,
  { params: { testId } }: { params: { testId: string } }
) {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return NextResponse.json(
      { error: "You are not authorized to save tests" },
      { status: 403 }
    );
  }

  // Validate the request body
  const data = await req.json();
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

  // Check if the test exists
  try {
    const res = await db
      .select()
      .from(testsTable)
      .where(eq(testsTable.id, testId));
    if (!res[0]) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    if (res[0].creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this test" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.log("Error checking if the test exists in db", error);
    return NextResponse.json(
      { error: "We cannot check if the test exists" },
      { status: 500 }
    );
  }

  // Save the test to the database
  const answerStr = answers.map((answer) => answer.ans).join(",");
  try {
    await db.execute(sql`
      UPDATE tests
      SET title = ${title},
          questions = ${passage},
          answers = ${answerStr}
      WHERE id = ${testId}
      `);
  } catch (error) {
    console.log("Error saving edited test to the database:", error);
    return NextResponse.json(
      { error: "We cannot save the edited test to the database" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Test saved successfully" });
}
