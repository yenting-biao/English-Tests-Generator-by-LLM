import { db } from "@/db";
import {
  assignedTestsTable,
  submittedTestsTable,
  testsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { studentSubmitTestSchema } from "@/lib/validators/studentTest";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params: { testId } }: { params: { testId: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect("/login");
  }
  console.log("student id", typeof session.user.id);

  const body = await req.json();
  const validatedData = studentSubmitTestSchema.safeParse(body);
  if (!validatedData.success) {
    console.log("Error when validating data: ", validatedData.error);
    return NextResponse.json(
      { error: "We cannot validate your data" },
      { status: 400 }
    );
  }

  const answers = validatedData.data.blanks;
  const formattedAnswers = answers.map((answer) => answer.trim()).join(",");
  const student = session.user;

  // Check test is assigned to this class
  const assignedTestInfos = await db
    .select()
    .from(assignedTestsTable)
    .where(
      and(
        eq(assignedTestsTable.testId, testId),
        eq(assignedTestsTable.classNumber, student.classNumber)
      )
    )
    .limit(1)
    .execute();
  const testInfos = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .execute();
  if (assignedTestInfos.length === 0 || testInfos.length === 0) {
    return NextResponse.json(
      { error: "We cannot find this test." },
      { status: 404 }
    );
  }
  const assignedTestInfo = assignedTestInfos[0];
  const testInfo = testInfos[0];

  // Check if the test is expired or not started
  const now = new Date();
  const startDate = new Date(assignedTestInfo.startDate);
  const endDate = new Date(assignedTestInfo.endDate);
  if (now < startDate || now > endDate) {
    return NextResponse.json(
      { error: "This test is not available to submit now." },
      { status: 400 }
    );
  }

  // Check if the student has already submitted this test
  const submittedTests = await db
    .select()
    .from(submittedTestsTable)
    .where(
      and(
        eq(submittedTestsTable.studentId, student.id),
        eq(submittedTestsTable.testId, testId)
      )
    )
    .execute();
  if (submittedTests.length > 0) {
    return NextResponse.json(
      { error: "You have already submitted this test." },
      { status: 400 }
    );
  }

  // Save the answers to the database
  try {
    await db.insert(submittedTestsTable).values({
      studentId: student.id,
      testId: testId,
      submittedAnswers: formattedAnswers,
    });
  } catch (error) {
    console.log("Error when saving answers to DB: ", error);
    return NextResponse.json(
      { error: "We cannot save your submission to DB." },
      { status: 500 }
    );
  }

  // If this test shows answers, return answers to student
  if (assignedTestInfo.showAnswers) {
    const answers = testInfo.answers.split(",");
    return NextResponse.json(
      { showAnswers: true, answers: answers },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { showAnswers: false, answers: [] },
      { status: 200 }
    );
  }
}
