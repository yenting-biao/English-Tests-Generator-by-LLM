"use client";

import GenResult from "@/app/admin/_components/GenResult";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Question } from "@/lib/validators/genQA";
import { useState } from "react";

type Props = {
  testId: string;
  title: string;
  passage: string;
  questions: Question[];
};

export default function TestEditor({
  testId,
  title,
  passage,
  questions,
}: Props) {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Button
          onClick={() => setEditing(!editing)}
          variant={editing ? "outline" : "default"}
        >
          {editing ? "Cancel edit" : "Edit the test"}
        </Button>
      </div>
      {editing ? (
        <div className="pl-3">
          <GenResult
            setEditing={setEditing}
            testId={testId}
            isLoading={false}
            isEdit={true}
            title={title}
            passage={passage}
            questions={questions}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <p className="mb-3">
              Below is what the students will see in the test:
            </p>
            <div className="border border-foreground rounded p-3 space-y-3">
              <div>
                <p className="font-bold text-lg mb-3">{title}</p>
                <div className="whitespace-pre-wrap text-justify">
                  {passage}
                </div>
              </div>
              <div>
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="py-3">
                    <p className="whitespace-pre-wrap text-justify">
                      {questionIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-1 mt-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2 whitespace-pre-wrap text-justify"
                        >
                          <div>({String.fromCharCode(65 + optionIndex)})</div>
                          <div>{option.option}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-3">
              Below is the answer key for the test. They will not be visible to
              the students.
            </p>
            <div className="border border-foreground rounded p-3">
              {questions
                .map((question) => {
                  // the index of the answer
                  const answer = question.options.find((o) => o.correct);
                  return answer
                    ? String.fromCharCode(65 + question.options.indexOf(answer))
                    : "N/A";
                })
                .join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
