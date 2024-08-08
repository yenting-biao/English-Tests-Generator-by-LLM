import Profile from "./_components/Profile";
import TestPreview from "./_components/TestPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Test = {
  id: string;
  name: string;
  description: string;
  submitted: boolean;
  startTimestamp: string;
  endTimestamp: string;
};

export default function StudentPage() {
  const studentId = "B13902999";
  const studentName = "王小明";
  const classNumber = "10";
  const openingTests: Test[] = Array.from({ length: 3 }).map((_, i) => ({
    id: `${i}-fsghl9f`,
    name: `Test ${i}`,
    description:
      "This is a reading comprehension test generated by Large Language Model. Please read the passage and answer the questions.",
    submitted: (i & 1) === 0,
    startTimestamp: "2024-07-01T00:00:00Z",
    endTimestamp: "2024-09-01T15:59:59Z",
  }));
  const historyTests = openingTests.map((test) => ({
    ...test,
    submitted: true,
  }));

  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-3xl gap-2 md:gap-10">
      <Profile
        studentId={studentId}
        name={studentName}
        classNumber={classNumber}
      />
      <Accordion
        type="multiple"
        defaultValue={["Opening Tests"]}
        className="w-full"
      >
        <TestsDashboard title="Opening Tests" tests={openingTests} />
        <TestsDashboard title="Incoming Tests" tests={[]} />
        <TestsDashboard title="History Tests" tests={historyTests} />
      </Accordion>
    </div>
  );
}

type TestsDashboardProps = {
  tests: Test[];
  title: string;
};

function TestsDashboard({ tests, title }: TestsDashboardProps) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-2xl font-bold">
        {title}
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {tests.length > 0
          ? tests.map((test) => (
              <TestPreview
                key={test.id}
                id={test.id}
                name={test.name}
                description={test.description}
                submitted={test.submitted}
                startTimestamp={test.startTimestamp}
                endTimestamp={test.endTimestamp}
              />
            ))
          : "No tests of this type available."}
      </AccordionContent>
    </AccordionItem>
  );
}
