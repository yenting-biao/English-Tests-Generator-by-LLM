import React from "react";
import AdminPanel from "./_components/AdminPanel";

export default function AdminLayout(props: { children: React.ReactNode }) {
  return (
    <div className="space-y-10 w-full h-full">
      <AdminPanel />
      {props.children}
    </div>
  );
}
