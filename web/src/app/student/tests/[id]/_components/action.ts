import { db } from "@/db";
import {
  assignedTestsTable,
  submittedTestsTable,
  testsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function getTestById(testId: string) {
  const session = await auth();
  if (!session || !session.user) return null;

  const res = await db
    .select({
      title: testsTable.title,
      questions: testsTable.questions,
      ans: testsTable.answers,
      deadline: assignedTestsTable.endDate,
    })
    .from(testsTable)
    .innerJoin(assignedTestsTable, eq(testsTable.id, assignedTestsTable.testId))
    .where(
      and(
        eq(testsTable.id, testId),
        eq(assignedTestsTable.classNumber, session.user.classNumber)
      )
    )
    .execute();

  if (!res || res.length === 0) return null;

  const ret: {
    title: string;
    questions: string;
    numAns: number;
    deadline: Date;
  }[] = res.map((r) => {
    return {
      title: r.title,
      questions: r.questions,
      numAns: r.ans.split(",").length,
      deadline: r.deadline,
    };
  });
  return ret;
}

export async function getSubmitRecord(testId: string) {
  const session = await auth();
  if (!session || !session.user) return null;

  const res = await db
    .select({
      submittedAnswers: submittedTestsTable.submittedAnswers,
      submittedTimestamp: submittedTestsTable.submittedTimestamp,
    })
    .from(submittedTestsTable)
    .where(
      and(
        eq(submittedTestsTable.studentId, session.user.id),
        eq(submittedTestsTable.testId, testId)
      )
    )
    .execute();

  if (!res || res.length === 0) return null;

  return res[0];
}
