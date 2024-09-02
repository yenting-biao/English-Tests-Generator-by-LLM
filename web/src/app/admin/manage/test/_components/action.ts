import { db, studentdb } from "@/db";
import {
  assignedTestsTable,
  multipleChoiceQuestionTable,
  optionsTable,
  readingTestTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { ClassInfo } from "@/lib/types/db";
import { privateEnv } from "@/lib/validators/env";
import { SaveReadingCompResult } from "@/lib/validators/genQA";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getAllGeneratedTests() {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  const tests = await db
    .select()
    .from(readingTestTable)
    .where(eq(readingTestTable.creatorId, session.user.id))
    .orderBy(desc(readingTestTable.createdAt));
  return tests;
}

export async function getTestsById(id: string) {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  const [test] = await db
    .select()
    .from(readingTestTable)
    .where(
      and(
        eq(readingTestTable.creatorId, session.user.id),
        eq(readingTestTable.id, id)
      )
    )
    .execute();

  const tmpQuestions = await db
    .select()
    .from(multipleChoiceQuestionTable)
    .where(eq(multipleChoiceQuestionTable.readingTestId, id))
    .orderBy(asc(multipleChoiceQuestionTable.ind))
    .execute();
  const questions = await Promise.all(
    tmpQuestions.map(async (question) => {
      return {
        id: question.id,
        question: question.description,
        options: await db
          .select({
            id: optionsTable.id,
            option: optionsTable.option,
            correct: optionsTable.isCorrect,
          })
          .from(optionsTable)
          .where(eq(optionsTable.questionId, question.id))
          .orderBy(asc(optionsTable.ind))
          .execute(),
      };
    })
  );

  const finalTest: SaveReadingCompResult = {
    title: test.title,
    passage: test.passage,
    questions: questions,
  };
  return finalTest;
}

export async function getAllClasses() {
  "use server";
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return null;
  }

  // TODO: add `WHERE open = 1` to the query before production
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
