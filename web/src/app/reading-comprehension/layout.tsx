export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <h3 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
        Reading Comprehension Questions Generator
      </h3>
      {children}
    </>
  );
}
