"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AdminPanel() {
  return (
    <div>
      <Button onClick={() => signOut({ callbackUrl: "/admin/login" })}>
        Log out
      </Button>
    </div>
  );
}
