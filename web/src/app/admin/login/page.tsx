import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  console.log("admin session", session);
  if (session && session.user.username === "cmgao_llmgentest_admin") {
    redirect("/admin");
  }
  return (
    <div className="mx-auto my-auto">
      <h1 className="lg:text-5xl mb-5 scroll-m-20 text-4xl font-extrabold tracking-tight leading-relaxed text-center">
        Admin Login
      </h1>
      <LoginForm />
    </div>
  );
}
