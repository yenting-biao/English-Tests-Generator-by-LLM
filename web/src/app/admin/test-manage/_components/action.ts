import { db, studentdb } from "@/db";
import { assignedTestsTable, testsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ClassInfo } from "@/lib/types/db";
import { privateEnv } from "@/lib/validators/env";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getAllGeneratedTests() {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  const tests = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.creatorId, session.user.id))
    .orderBy(desc(testsTable.createdAt));
  return tests;
}

export async function getTestsById(id: string) {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }
  const tests = await db
    .select()
    .from(testsTable)
    .where(
      and(eq(testsTable.creatorId, session.user.id), eq(testsTable.id, id))
    );
  return tests[0];
}

export async function getAllClasses() {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  const [result] = await studentdb.query(`
    SELECT *
    FROM FreshmanEnglish_group
    ORDER BY id
  `);
  const classes = result as ClassInfo[];
  return classes;
}

export async function getTestAssignedClasses(testId: string) {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  const result = await db
    .select()
    .from(assignedTestsTable)
    .where(eq(assignedTestsTable.testId, testId))
    .orderBy(asc(assignedTestsTable.classNumber));
  return result;
}
