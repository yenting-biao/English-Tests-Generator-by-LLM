import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllGeneratedTests } from "./_components/action";
import { privateEnv } from "@/lib/validators/env";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function TestManagePage() {
  const session = await auth();
  if (!session || session.user.username !== privateEnv.ADMIN_USERNAME) {
    redirect("/admin/login");
  }
  const tests = await getAllGeneratedTests();

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-5">Publish Tests to Classes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
        {tests &&
          tests.map((test) => (
            <Link href={`/admin/manage/test/${test.id}`} key={test.id}>
              <Card className="hover:bg-secondary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{test.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{test.passage}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created at{" "}
                    {
                      new Date(test.createdAt)
                        .toISOString()
                        .split("T")
                        .join(" ")
                        .split(".")[0]
                    }
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
