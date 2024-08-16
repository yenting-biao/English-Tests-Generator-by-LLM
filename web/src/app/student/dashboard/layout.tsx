import { auth } from "@/lib/auth";
import Profile from "../_components/Profile";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) redirect("/student/login");

  const username = session.user.username;
  const classNumber = session.user.classNumber;
  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-3xl gap-2 md:gap-10">
      {session && <Profile username={username} classNumber={classNumber} />}
      {children}
    </div>
  );
}
