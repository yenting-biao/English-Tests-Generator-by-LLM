"use client";

import { ReadingForm } from "@/app/admin/reading-comprehension/_components/ReadingForm";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import GenerationResult from "../_components/GenerationResult";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full max-w-3xl space-y-4 mx-auto">
      <ReadingForm
        setResult={setResult}
        streaming={streaming}
        setStreaming={setStreaming}
        resultRef={resultRef}
      />
      <Separator className="max-w-3xl w-full mt-10" />
      <GenerationResult
        result={result}
        streaming={streaming}
        resultRef={resultRef}
      />
    </div>
  );
}
