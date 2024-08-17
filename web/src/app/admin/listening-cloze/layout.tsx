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
      <div>
        <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold text-center tracking-tight mb-2">
          Listening Cloze Tests Generator
        </h3>
        <h5 className="mb-10 font-extralight text-center">
          Submit an audio file or a transcript to generate a listening cloze
          test for your students.
        </h5>
      </div>
      {children}
    </>
  );
}
