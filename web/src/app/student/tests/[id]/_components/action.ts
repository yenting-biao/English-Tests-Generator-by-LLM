import { db } from "@/db";
import { assignedTestsTable, testsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTestById(testId: string) {
  const res = await db
    .select({
      title: testsTable.title,
      questions: testsTable.questions,
      ans: testsTable.answers,
      deadline: assignedTestsTable.endDate,
    })
    .from(testsTable)
    .innerJoin(assignedTestsTable, eq(testsTable.id, assignedTestsTable.testId))
    .where(eq(testsTable.id, testId))
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
