import { Textarea } from "@/components/ui/textarea";
import { DeepPartial } from "@/lib/utils";
import { ReadingCompResult } from "@/lib/validators/genQA";

export default function GenResult({
  passage,
  questions,
}: DeepPartial<ReadingCompResult>) {
  return (
    <div className="space-y-2">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
        The Generated Result:
      </h3>
      <div>
        <h2 className="text-xl font-bold">Passage</h2>
        <Textarea
          className="mt-2 min-h-96 whitespace-pre-wrap text-base"
          value={passage}
        />
      </div>
      <div>
        <h2 className="text-xl font-bold mt-4">Questions</h2>
        <p className="text-sm text-muted-foreground">
          The correct option is highlighted in green.
        </p>
        <ul className="mt-2 px-3 border rounded-md">
          {questions?.map((q, i) => (
            <li key={i} className="mt-4">
              <p>
                {i + 1}. {q?.question ?? ""}
              </p>
              <ul className="mt-1">
                {q?.options?.map((o, j) => (
                  <li
                    key={j}
                    className={q?.answer === j ? "text-green-600" : ""}
                  >
                    ({String.fromCharCode(65 + j)}) {o}
                  </li>
                ))}
              </ul>
              {/* <p className="mt-2">
                Ans: (
                {q?.answer !== undefined
                  ? String.fromCharCode(65 + q.answer)
                  : "Undefined"}
                )
              </p> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
