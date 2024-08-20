import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";
import { redirect } from "next/navigation";
import { privateEnv } from "@/lib/validators/env";

export default async function LoginPage() {
  const session = await auth();
  if (session && session.user.username === privateEnv.ADMIN_USERNAME) {
    redirect("/admin");
  }
  return (
    <div className="pt-20">
      <h1 className="lg:text-3xl mb-2 scroll-m-20 text-2xl font-extrabold tracking-tight leading-relaxed text-center">
        Admin Login
      </h1>
      <LoginForm />
    </div>
  );
}
