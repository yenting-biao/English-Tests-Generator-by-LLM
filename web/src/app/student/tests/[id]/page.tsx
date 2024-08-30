import { CalendarCheck2, CircleAlert, CircleCheckBig } from "lucide-react";
import { getSubmitRecord, getTestById } from "./_components/action";
import TestSubmissionForm from "./_components/TestSubmissionForm";
import { format } from "date-fns";
import LinkifyPassage from "./_components/LinkifyPassage";

type Props = {
  params: { id: string };
};

export default async function TestsPage({ params: { id } }: Props) {
  const test = await getTestById(id);
  const submitRecord = await getSubmitRecord(id);
  if (!test) {
    return <div>Test not found</div>;
  }
  if (test.startDate > new Date()) {
    return <div>Test not started</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-2 ">
        <h1 className="text-2xl font-bold">
          {test.title}
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
          ) : (
            <>
              <CircleAlert
                size={16}
                className="inline-block ml-3 mr-1 text-red-500"
              />
              <span className="text-red-500 text-sm inline-block font-normal">
                Not submitted.
              </span>
            </>
          )}
        </h1>
        <p className="text-base">
          <CalendarCheck2 size={20} className="inline-block mr-2" />
          Deadline: {format(test.endDate, "yyyy/MM/dd HH:mm")}
        </p>
      </div>
      <LinkifyPassage passage={test.passage} />
      <TestSubmissionForm
        questions={test.questions}
        testId={id}
        disable={submitRecord ? true : false}
        submittedAnswers={submitRecord?.submittedAnswers.split(",")}
      />
    </div>
  );
}
