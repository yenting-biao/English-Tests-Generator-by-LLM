"use client";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminPanel() {
  const { data } = useSession();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 pb-5 dark:border-b-white border-b-black">
      <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tighter leading-tight lg:text-3xl text-left">
        <Link href="/admin">Tests Generator (Admin)</Link>
      </h1>
      {data && data.user && (
        <div className="mt-5 sm:mt-0 flex flex-row items-center justify-between">
          <div>
            <User
              className="mr-2 inline-block rounded-full border border-black dark:border-white p-1"
              size={30}
            />
            <span className="mr-4 text-sm">{data.user.username}</span>
          </div>
          <Button
            className="self-end"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
