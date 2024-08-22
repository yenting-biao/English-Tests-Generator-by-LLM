import { CalendarCheck2, CircleCheckBig } from "lucide-react";
import { getSubmitRecord, getTestById } from "./_components/action";
import TestSubmissionForm from "./_components/TestSubmissionForm";
import { format } from "date-fns";
import LinkifyTestQuestions from "./_components/TestQuestions";

type Props = {
  params: { id: string };
};

export default async function TestsPage({ params: { id } }: Props) {
  const tests = await getTestById(id);
  const submitRecord = await getSubmitRecord(id);
  if (!tests || tests.length === 0) {
    return <div>Test not found</div>;
  }
  const testDetails = tests[0];

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-2 ">
        <h1 className="text-2xl font-bold">
          {testDetails.title}
          {submitRecord ? (
            <>
              <CircleCheckBig
                size={20}
                className="inline-block ml-3 mr-1 text-green-500"
              />
              <span className="text-green-500 text-sm inline-block font-normal">
                Submitted!
              </span>
            </>
          ) : null}
        </h1>
        <p className="text-base">
          <CalendarCheck2 size={20} className="inline-block mr-2" />
          Deadline: {format(testDetails.deadline, "yyyy/MM/dd HH:mm")}
        </p>
      </div>
      <LinkifyTestQuestions questions={testDetails.questions} />
      <TestSubmissionForm
        numBlanks={testDetails.numAns}
        testId={id}
        disable={submitRecord ? true : false}
        submittedAnswers={submitRecord?.submittedAnswers.split(",")}
      />
    </div>
  );
}
