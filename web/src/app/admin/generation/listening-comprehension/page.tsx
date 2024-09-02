"use client";
import { useState, useRef } from "react";
import { ListeningForm } from "./_components/ListeningForm";
import { Separator } from "@/components/ui/separator";
import GenerationResult from "../../_components/GenerationResult";
import SavedTestForm from "../../_components/SaveTestForm";

export default function ListeningPage() {
  const [streaming, setStreaming] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full max-w-3xl space-y-4 mx-auto">
      <ListeningForm
        streaming={streaming}
        setStreaming={setStreaming}
        resultRef={resultRef}
        setResult={setResult}
      />
      <Separator className="max-w-3xl w-full mt-10" />
      <GenerationResult
        streaming={streaming}
        result={result}
        resultRef={resultRef}
      />
      <SavedTestForm />
    </div>
  );
}
