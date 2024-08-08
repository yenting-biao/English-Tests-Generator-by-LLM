import { User } from "lucide-react";

type ProfileProps = {
  studentId: string;
  name: string;
  classNumber: string;
};

export default function Profile({
  studentId,
  name,
  classNumber,
}: ProfileProps) {
  return (
    <div className="flex flex-row md:flex-col items-center gap-5 md:gap-2 h-full px-3">
      <User
        size="88"
        className="border-2 rounded-full p-2 border-secondary-foreground"
      />
      <div className="flex flex-col items-start md:items-center font-semibold text-lg">
        <p>Class {classNumber}</p>
        <p>{studentId}</p>
        <p>{name}</p>
      </div>
    </div>
  );
}
