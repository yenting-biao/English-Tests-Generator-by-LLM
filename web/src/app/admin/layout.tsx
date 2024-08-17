import React from "react";
import AdminPanel from "./_components/Panel";

export default function AdminLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <AdminPanel />
      {props.children}
    </div>
  );
}
