import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { NextRequest, NextResponse } from "next/server";
import { extendAddClassToTestSchema } from "@/lib/validators/classTest";
import { db } from "@/db";
import { assignedTestsTable } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return NextResponse.json(
      { error: "You are not authorized to add a class to test" },
      { status: 403 }
    );
  }

  const data = await req.json();
  let testId, classNumber, showAnswer, startTimeStamp, endTimeStamp;
  // validate data
  try {
    const validatedData = extendAddClassToTestSchema.parse(data);
    testId = validatedData.testId;
    classNumber = validatedData.classNumber;
    showAnswer = validatedData.showAnswer;
    startTimeStamp = validatedData.startTimeStamp;
    endTimeStamp = validatedData.endTimeStamp;
  } catch (error) {
    console.log("Error when validating data", error);
    return NextResponse.json(
      { error: "We cannot validate the data" },
      { status: 400 }
    );
  }

  // check duplicate
  try {
    const duplicate = await db
      .select()
      .from(assignedTestsTable)
      .where(
        and(
          eq(assignedTestsTable.testId, testId),
          eq(assignedTestsTable.classNumber, classNumber)
        )
      );
    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: "This test has already been assigned to this class" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error when checking duplicate in DB", error);
    return NextResponse.json(
      { error: "We cannot check duplicate in DB" },
      { status: 500 }
    );
  }

  try {
    await db
      .insert(assignedTestsTable)
      .values({
        testId: testId,
        classNumber: classNumber,
        showAnswers: showAnswer,
        startDate: new Date(startTimeStamp),
        endDate: new Date(endTimeStamp),
      })
      .execute();
  } catch (error) {
    console.log("Error when inserting data to DB: " + error);
    return NextResponse.json(
      { error: "We cannot insert the data to DB." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 200 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return NextResponse.json(
      {
        error: "You are not authorized to edit this test and assigned classes",
      },
      { status: 403 }
    );
  }

  const data = await req.json();
  let testId, classNumber, showAnswer, startTimeStamp, endTimeStamp;
  // validate data
  try {
    const validatedData = extendAddClassToTestSchema.parse(data);
    testId = validatedData.testId;
    classNumber = validatedData.classNumber;
    showAnswer = validatedData.showAnswer;
    startTimeStamp = validatedData.startTimeStamp;
    endTimeStamp = validatedData.endTimeStamp;
  } catch (error) {
    console.log("Error when validating data: ", error);
    return NextResponse.json(
      { error: "We cannot validate the data" },
      { status: 400 }
    );
  }

  // check existence
  try {
    const duplicate = await db
      .select()
      .from(assignedTestsTable)
      .where(
        and(
          eq(assignedTestsTable.testId, testId),
          eq(assignedTestsTable.classNumber, classNumber)
        )
      );
    if (duplicate.length == 0) {
      return NextResponse.json(
        { error: "This test has already been assigned to this class" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error when checking duplicate in DB", error);
    return NextResponse.json(
      { error: "We cannot check duplicate in DB" },
      { status: 500 }
    );
  }

  // update data
  try {
    await db
      .update(assignedTestsTable)
      .set({
        showAnswers: showAnswer,
        startDate: new Date(startTimeStamp),
        endDate: new Date(endTimeStamp),
      })
      .where(
        and(
          eq(assignedTestsTable.testId, testId),
          eq(assignedTestsTable.classNumber, classNumber)
        )
      )
      .execute();
  } catch (error) {
    console.log("Error when updating data to DB: " + error);
    return NextResponse.json(
      { error: "We cannot update the data to DB." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 200 });
}

const deleteClassFromTestSchema = z.object({
  testId: z.string(),
  classNumber: z.number(),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    return NextResponse.json(
      {
        error:
          "You are not authorized to delete this test and assigned classes",
      },
      { status: 403 }
    );
  }

  const data = await req.json();
  let testId, classNumber;
  // validate data
  try {
    const validatedData = deleteClassFromTestSchema.parse(data);
    testId = validatedData.testId;
    classNumber = validatedData.classNumber;
  } catch (error) {
    console.log("Error when validating data: ", error);
    return NextResponse.json(
      { error: "We cannot validate the data" },
      { status: 400 }
    );
  }

  // check existence
  try {
    const res = await db
      .select()
      .from(assignedTestsTable)
      .where(
        and(
          eq(assignedTestsTable.testId, testId),
          eq(assignedTestsTable.classNumber, classNumber)
        )
      );
    if (res.length == 0) {
      return NextResponse.json(
        { error: "This test did not assign to this class." },
        { status: 400 }
      );
    } else if (res.length > 1) {
      return NextResponse.json(
        { error: "This test has been assigned to this class multiple times." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error when checking duplicate in DB", error);
    return NextResponse.json(
      { error: "We cannot check duplicate in DB" },
      { status: 500 }
    );
  }

  // delete data
  try {
    await db.execute(sql`
        DELETE FROM ${assignedTestsTable}
        WHERE test_id = ${testId} AND class_number = ${classNumber}
      `);
  } catch (error) {
    console.log("Error when deleting data to DB: " + error);
    return NextResponse.json(
      { error: "We cannot delete the data to DB." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 200 });
}
