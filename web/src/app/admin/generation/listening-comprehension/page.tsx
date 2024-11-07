"use client";
import { ListeningForm } from "./_components/ListeningForm";
import { Separator } from "@/components/ui/separator";
import { experimental_useObject as useObject } from "ai/react";
import GenResult from "../../_components/GenResult";
import { listeningCompResultSchema } from "@/lib/validators/genQA";
import { useState } from "react";

export default function ListeningPage() {
  const [url, setUrl] = useState("");
  const { submit, isLoading, object, stop } = useObject({
    api: "/api/admin/generation/listening",
    schema: listeningCompResultSchema,
    // onFinish({ object }) {
    //   console.log("onFinish", object);
    // },
  });

  return (
    <div className="w-full max-w-3xl space-y-4 mx-auto">
      <ListeningForm submit={submit} isLoading={isLoading} setUrl={setUrl} />
      <Separator className="max-w-3xl w-full mt-10" />
      {/* <GenerationResult
        streaming={streaming}
        result={result}
        resultRef={resultRef}
      />
      <SavedTestForm /> */}
      <GenResult
        passage={`Please watch the video and answer the questions below: ${url}`}
        questions={object?.questions}
        isLoading={isLoading}
        onStop={stop}
      />
    </div>
  );
}
