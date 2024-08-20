"use client";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

type GenerationResultProps = {
  result: string;
  streaming: boolean;
  resultRef: React.RefObject<HTMLDivElement>;
};

export default function GenerationResult({
  result,
  streaming,
  resultRef,
}: GenerationResultProps) {
  const resultEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (
      result.length > 0 &&
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
  }, [result, resultRef]);
  return (
    <div className="max-w-3xl w-full h-dvh py-5 flex flex-col">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
        The Generated Result:
      </h3>
      <div
        className="w-full h-full whitespace-pre-wrap scroll-smooth overflow-y-scroll p-5 border border-border rounded-xl"
        ref={resultRef}
      >
        <p>{result}</p>
        <div ref={resultEndRef} />
      </div>
      <CopyButton result={result} streaming={streaming} />
    </div>
  );
}

function CopyButton({
  result,
  streaming,
}: {
  result: string;
  streaming: boolean;
}) {
  const [justCopied, setJustCopied] = useState<boolean>(false);
  useEffect(() => {
    if (justCopied) {
      const timeout = setTimeout(() => {
        setJustCopied(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [justCopied]);

  return (
    <Button
      className="w-fit mt-5"
      onClick={() => {
        setJustCopied(true);
        navigator.clipboard.writeText(result);
      }}
      disabled={justCopied || streaming}
    >
      {streaming ? (
        "Generating..."
      ) : justCopied ? (
        <>
          <Check size={16} className="mr-2" /> Copied
        </>
      ) : (
        <>
          <Copy size={16} className="mr-2" /> Copy
        </>
      )}
    </Button>
  );
}
