import { GenQAForm } from "@/components/GenQAForm";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-8">
      <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
        Reading Comprehension Questions Generator
      </h3>
      <GenQAForm />
    </main>
  );
}
