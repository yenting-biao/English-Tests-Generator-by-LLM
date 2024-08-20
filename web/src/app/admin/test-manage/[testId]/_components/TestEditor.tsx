"use client";

import SavedTestForm from "@/app/admin/_components/SaveTestForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  testId: string;
  testTitle: string;
  testQuestions: string;
  testAnswers: string;
};

export default function TestEditor({
  testId,
  testTitle,
  testQuestions,
  testAnswers,
}: Props) {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Button
          onClick={() => setEditing(!editing)}
          variant={editing ? "destructive" : "default"}
        >
          {editing ? "Cancel edit" : "Edit the test"}
        </Button>
      </div>
      {editing ? (
        <SavedTestForm
          testId={testId}
          testTitle={testTitle}
          testQuestions={testQuestions}
          testAnswers={testAnswers}
          setEditing={setEditing}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">Test Title</h3>
            <p>{testTitle}</p>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">
              Test Questions and Instructions
            </h3>
            <p className="text-sm text-muted-foreground mb-3 ">
              Note that this is what the students will see when they take the
              test. You can copy the generated result above and paste it here
              with some modifications. Just make sure the answers are not
              included here.
            </p>
            <p className="whitespace-pre-wrap text-justify">{testQuestions}</p>
          </div>
          <div className="flex flex-col whitespace-pre-wrap">
            <h3 className="text-xl font-semibold">Test Answers</h3>
            {testAnswers
              .split(",")
              .map((ans, ind) => `${ind + 1}. ${ans}`)
              .join("\n")}
          </div>
        </div>
      )}
    </div>
  );
}
