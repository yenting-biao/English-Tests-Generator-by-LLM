import { db } from "@/db";
import { testsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { and, desc, eq } from "drizzle-orm";

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
    .orderBy(desc(testsTable.id));
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
