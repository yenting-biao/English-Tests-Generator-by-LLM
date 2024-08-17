import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reading Comprehension Tests Generator",
  description:
    "Generate reading comprehension tests for your students by Large Language Models.",
};

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session || !session.user) redirect("/admin/login");
  return (
    <>
      <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-5 text-center">
        Reading Comprehension Tests Generator
      </h3>
      {children}
    </>
  );
}
