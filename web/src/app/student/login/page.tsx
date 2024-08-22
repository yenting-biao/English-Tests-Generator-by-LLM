import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session && session.user) redirect("/student/dashboard");

  return (
    <div className="mx-auto my-auto">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-wide lg:text-5xl mb-5">
        Student Login
      </h1>
      <LoginForm />
    </div>
  );
}
