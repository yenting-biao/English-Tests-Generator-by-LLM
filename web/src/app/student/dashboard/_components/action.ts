import { db } from "@/db";
import { assignedTestsTable, readingTestTable } from "@/db/schema";
import { and, eq, gt, gte, lt, lte } from "drizzle-orm";

export async function getOpeningTests(classNumber: number) {
  const currentTimestamp = new Date();
  const result = await db
    .select({
      testId: readingTestTable.id,
      testTitle: readingTestTable.title,
      startDate: assignedTestsTable.startDate,
      endDate: assignedTestsTable.endDate,
    })
    .from(assignedTestsTable)
    .innerJoin(
      readingTestTable,
      eq(assignedTestsTable.testId, readingTestTable.id)
    )
    .where(
      and(
        eq(assignedTestsTable.classNumber, classNumber),
        lte(assignedTestsTable.startDate, currentTimestamp),
        gte(assignedTestsTable.endDate, currentTimestamp)
      )
    )
    .execute();
  return result;
}

export async function getHistoryTests(classNumber: number) {
  const currentTimestamp = new Date();
  const result = await db
    .select({
      testId: readingTestTable.id,
      testTitle: readingTestTable.title,
      startDate: assignedTestsTable.startDate,
      endDate: assignedTestsTable.endDate,
    })
    .from(assignedTestsTable)
    .innerJoin(
      readingTestTable,
      eq(assignedTestsTable.testId, readingTestTable.id)
    )
    .where(
      and(
        eq(assignedTestsTable.classNumber, classNumber),
        lt(assignedTestsTable.endDate, currentTimestamp)
      )
    )
    .execute();
  return result;
}

export async function getUpcomingTests(classNumber: number) {
  const currentTimestamp = new Date();
  const result = await db
    .select({
      testId: readingTestTable.id,
      testTitle: readingTestTable.title,
      startDate: assignedTestsTable.startDate,
      endDate: assignedTestsTable.endDate,
    })
    .from(assignedTestsTable)
    .innerJoin(
      readingTestTable,
      eq(assignedTestsTable.testId, readingTestTable.id)
    )
    .where(
      and(
        eq(assignedTestsTable.classNumber, classNumber),
        gt(assignedTestsTable.startDate, currentTimestamp)
      )
    )
    .execute();
  return result;
}
