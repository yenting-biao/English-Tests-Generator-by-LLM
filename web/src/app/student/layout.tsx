import Profile from "./_components/Profile";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const studentId = "B13902999";
  const studentName = "王小明";
  const classNumber = "10";
  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-3xl gap-2 md:gap-10">
      <Profile
        studentId={studentId}
        name={studentName}
        classNumber={classNumber}
      />
      {children}
    </div>
  );
}
