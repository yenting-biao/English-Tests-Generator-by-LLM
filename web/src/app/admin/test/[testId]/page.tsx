import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { redirect } from "next/navigation";
import {
  getAllClasses,
  getTestAssignedClasses,
  getTestsById,
} from "../_components/action";
import TestEditor from "./_components/TestEditor";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import AssignedClass from "./_components/AssignedClass";

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
  const allClasses = await getAllClasses();
  const assignedClasses = await getTestAssignedClasses(testId);
  // map class id to class name
  const classNameDict = allClasses
    ? allClasses.reduce((acc, cur) => {
        acc[cur.id] = cur.name;
        return acc;
      }, {} as { [key: number]: string })
    : {};
  // console.log("classNameDict", classNameDict);

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        //defaultValue="test-details"
        className="w-full"
      >
        <AccordionItem value="test-details">
          <AccordionTrigger className="text-3xl font-semibold">
            Test Details
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <TestEditor
              testId={testId}
              title={testDetail.title}
              passage={testDetail.passage}
              questions={testDetail.questions}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="assigned-classes">
          <AccordionTrigger className="text-3xl font-semibold">
            Assigned Classes
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <AssignedClass
              testId={testId}
              classNameDict={classNameDict}
              assignedClasses={assignedClasses ?? []}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
