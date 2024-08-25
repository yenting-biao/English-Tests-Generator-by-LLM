"use client";

import { Separator } from "@/components/ui/separator";
import { readingCompResultSchema } from "@/lib/validators/genQA";
import ReadingForm from "./_components/ReadingForm";
import { experimental_useObject as useObject } from "ai/react";
import GenResult from "../_components/GenResult";

export default function Home() {
  const { submit, isLoading, object } = useObject({
    api: "/api/reading",
    schema: readingCompResultSchema,
    onFinish({ object }) {
      console.log("onFinish", object);
    },
  });

  return (
    <div className="w-full max-w-3xl space-y-4 mx-auto">
      <ReadingForm submit={submit} isLoading={isLoading} />
      <Separator className="max-w-3xl w-full mt-10" />
      <GenResult
        passage={object?.passage}
        questions={object?.questions}
        isLoading={isLoading}
      />
    </div>
  );
}
