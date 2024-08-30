import { db } from "@/db";
import {
  assignedTestsTable,
  multipleChoiceQuestionTable,
  optionsTable,
  readingTestTable,
  submittedTestsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, asc, eq } from "drizzle-orm";

export type MultipleChoiceQuestion = {
  id: string;
  ind: number;
  question: string;
  options: {
    id: string;
    option: string;
    ind: number;
  }[];
};

export async function getTestById(testId: string) {
  const session = await auth();
  if (!session || !session.user) return null;
  const user = session.user;

  const [test] = await db
    .select({
      testId: readingTestTable.id,
      title: readingTestTable.title,
      passage: readingTestTable.passage,
      startDate: assignedTestsTable.startDate,
      endDate: assignedTestsTable.endDate,
    })
    .from(readingTestTable)
    .innerJoin(
      assignedTestsTable,
      eq(readingTestTable.id, assignedTestsTable.testId)
    )
    .where(
      and(
        eq(readingTestTable.id, testId),
        eq(assignedTestsTable.classNumber, user.classNumber)
      )
    )
    .execute();

  if (!test) return null;

  const questions = await db
    .select({
      id: multipleChoiceQuestionTable.id,
      ind: multipleChoiceQuestionTable.ind,
      question: multipleChoiceQuestionTable.description,
    })
    .from(multipleChoiceQuestionTable)
    .where(eq(multipleChoiceQuestionTable.readingTestId, testId))
    .orderBy(asc(multipleChoiceQuestionTable.ind))
    .execute();

  const fullQuestions = await Promise.all(
    questions.map(async (q) => {
      const options = await db
        .select({
          id: optionsTable.id,
          option: optionsTable.option,
          ind: optionsTable.ind,
        })
        .from(optionsTable)
        .where(eq(optionsTable.questionId, q.id))
        .orderBy(asc(optionsTable.ind))
        .execute();

      return {
        ...q,
        options: options,
      };
    })
  );

  const ret: {
    title: string;
    passage: string;
    questions: MultipleChoiceQuestion[];
    startDate: Date;
    endDate: Date;
  } = {
    title: test.title,
    passage: test.passage,
    questions: fullQuestions,
    startDate: test.startDate,
    endDate: test.endDate,
  };
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
