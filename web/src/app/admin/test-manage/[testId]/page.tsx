import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/validators/env";
import { redirect } from "next/navigation";
import { getTestsById } from "../_components/action";

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
      <h1 className="text-3xl font-semibold mb-5">TestsDetailPage</h1>
      <p>{testDetail.title}</p>
      <p className="whitespace-pre-wrap">{testDetail.questions}</p>
      <p>{testDetail.answers}</p>
    </div>
  );
}
