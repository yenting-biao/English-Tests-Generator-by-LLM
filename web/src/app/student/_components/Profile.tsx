"use client";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { signOut } from "next-auth/react";

type ProfileProps = {
  username: string;
  className?: string;
};

export default function Profile({ username, className }: ProfileProps) {
  return (
    <div className="flex flex-row md:flex-col items-center gap-5 md:gap-2 h-full px-3">
      <User
        size="88"
        className="border-2 rounded-full p-2 border-secondary-foreground"
      />
      <div className="flex flex-col items-start md:items-center text-lg">
        <p className="font-bold">{username}</p>
        <p className="text-center font-normal">{className}</p>
      </div>
      <Button
        className="w-fit py-2 px-6 ml-auto md:mx-auto"
        onClick={() => signOut({ callbackUrl: "/student/login" })}
      >
        Log Out
      </Button>
    </div>
  );
}
