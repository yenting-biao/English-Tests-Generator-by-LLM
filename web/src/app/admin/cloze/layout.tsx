export const metadata = {
  title: "Cloze Tests Generator",
  description:
    "Generate cloze tests for your students by Large Language Models.",
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
        Cloze Tests Generator
      </h3>
      {children}
    </>
  );
}
