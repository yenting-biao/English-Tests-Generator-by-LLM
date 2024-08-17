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
    <div className="pt-40">
      <h1 className="lg:text-3xl mb-2 scroll-m-20 text-2xl font-extrabold tracking-tight leading-relaxed text-center">
        Admin Login
      </h1>
      <LoginForm />
    </div>
  );
}
