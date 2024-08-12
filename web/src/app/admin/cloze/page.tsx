"use client";
import { useState, useRef } from "react";
import { ClozeForm } from "./_components/ClozeForm";
import { Separator } from "@/components/ui/separator";

export default function ListeningPage() {
  const [streaming, setStreaming] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full max-w-3xl space-y-4">
      <ClozeForm
        streaming={streaming}
        setStreaming={setStreaming}
        resultRef={resultRef}
        setResult={setResult}
      />
      <Separator className="max-w-3xl w-full mt-10" />
      <div className="max-w-3xl w-full h-dvh py-5 flex flex-col">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
          The Generated Cloze Test:
        </h3>
        <div
          className="w-full h-full whitespace-pre-wrap scroll-smooth overflow-y-scroll p-5 border-2 border-black dark:border-neutral-50 rounded-xl"
          ref={resultRef}
        >
          <p>{result}</p>
        </div>
      </div>
    </div>
  );
}
