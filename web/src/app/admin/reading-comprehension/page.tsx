"use client";

import { Separator } from "@/components/ui/separator";
import { useRef } from "react";
import SavedTestForm from "../_components/SaveTestForm";
import { readingCompResultSchema } from "@/lib/validators/genQA";
import ReadingForm from "./_components/ReadingForm";
import { experimental_useObject as useObject } from "ai/react";
import GenResult from "../_components/GenResult";

export default function Home() {
  const resultRef = useRef<HTMLDivElement | null>(null);

  const { submit, isLoading, object } = useObject({
    api: "/api/reading",
    schema: readingCompResultSchema,
    onFinish({ object }) {
      // if (object != null) {
      //   setObjectResult(object);
      // }
      console.log("onFinish", object);
    },
  });

  return (
    <div className="w-full max-w-3xl space-y-4 mx-auto">
      <ReadingForm submit={submit} isLoading={isLoading} />
      <Separator className="max-w-3xl w-full mt-10" />
      <GenResult passage={object?.passage} questions={object?.questions} />
      <SavedTestForm />
    </div>
  );
}
