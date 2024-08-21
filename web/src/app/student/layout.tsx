import { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Online Tests",
  description:
    "Generate english tests for your students by Large Language Models.",
};
export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
