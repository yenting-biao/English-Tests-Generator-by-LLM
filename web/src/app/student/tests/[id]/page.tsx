import { CalendarCheck2 } from "lucide-react";
import { getTestById } from "./_components/action";
import TestSubmissionForm from "./_components/TestSubmissionForm";
import { format } from "date-fns";

type Props = {
  params: { id: string };
};

export default async function TestsPage({ params: { id } }: Props) {
  const tests = await getTestById(id);
  if (!tests || tests.length === 0) {
    return <div>Test not found</div>;
  }
  const testDetails = tests[0];
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-bold">{testDetails.title}</h1>
        <p className="text-base">
          <CalendarCheck2 size={20} className="inline-block mr-2" />
          Deadline: {format(testDetails.deadline, "yyyy/MM/dd hh:mm:ss a")}
        </p>
      </div>
      <p className="whitespace-pre-wrap text-justify">
        {testDetails.questions}
      </p>
      <TestSubmissionForm numBlanks={testDetails.numAns} testId={id} />
    </div>
  );
}
