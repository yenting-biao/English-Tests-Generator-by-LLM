"use client";

import { GenQAForm } from "@/components/GenQAForm";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const resultEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (
      resultEndRef.current &&
      resultRef.current &&
      resultRef.current.scrollHeight > resultRef.current.clientHeight
    ) {
      resultEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [result]);
  return (
    <>
      <GenQAForm
        setResult={setResult}
        streaming={streaming}
        setStreaming={setStreaming}
        resultRef={resultRef}
      />
      <Separator className="max-w-3xl w-full mt-10" />
      <div className="max-w-3xl w-full h-dvh py-5 flex flex-col">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
          The Generated Passage, Questions, and Answers:
        </h3>
        <div
          className="w-full h-full whitespace-pre-wrap scroll-smooth overflow-y-scroll p-5 border-2 border-black dark:border-neutral-50 rounded-xl"
          ref={resultRef}
        >
          {result}
          <div ref={resultEndRef} />
        </div>
      </div>
    </>
  );
}
