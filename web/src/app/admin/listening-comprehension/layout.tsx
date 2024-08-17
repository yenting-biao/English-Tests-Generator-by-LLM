export const metadata = {
  title: "Listening Comprehension Tests Generator",
  description:
    "Generate listening comprehension tests for your students by Large Language Models.",
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-10 text-center">
        Listening Comprehension Tests Generator
      </h3>
      {children}
    </>
  );
}
