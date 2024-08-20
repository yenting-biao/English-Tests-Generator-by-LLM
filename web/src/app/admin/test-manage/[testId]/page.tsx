import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { redirect } from "next/navigation";
import { getTestsById } from "../_components/action";
import TestEditor from "./_components/TestEditor";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type Props = {
  params: { testId: string };
};

export default async function TestsDetailPage({ params: { testId } }: Props) {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    redirect("/admin/login");
  }

  const testDetail = await getTestsById(testId);
  if (!testDetail) {
    return <div>Test not found</div>;
  }

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        defaultValue="test-details"
        className="w-full"
      >
        <AccordionItem value="test-details">
          <AccordionTrigger className="text-3xl font-semibold">
            Test Details
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <TestEditor
              testId={testId}
              testTitle={testDetail.title}
              testQuestions={testDetail.questions}
              testAnswers={testDetail.answers}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="assigned-classes">
          <AccordionTrigger className="text-3xl font-semibold">
            Assigned Classes
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <div>Assigned Classes</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
