import { db } from "@/db";
import { assignedTestsTable, testsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getOpeningTests(classNumber: number) {
  const result = await db
    .select({
      testId: testsTable.id,
      testTitle: testsTable.title,
      startDate: assignedTestsTable.startDate,
      endDate: assignedTestsTable.endDate,
    })
    .from(assignedTestsTable)
    .innerJoin(testsTable, eq(assignedTestsTable.testId, testsTable.id))
    .where(eq(assignedTestsTable.classNumber, classNumber))
    .execute();
  return result;
}
