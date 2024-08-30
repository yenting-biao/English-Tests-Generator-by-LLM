import { studentdb } from "@/db";

export async function getClassName(classNumber: number) {
  "use server";
  if (classNumber === 0) return "Class ADMIN";
  const [result] = await studentdb.query(
    "SELECT name FROM `FreshmanEnglish_group` WHERE `id` = ?",
    [classNumber]
  );
  if (!result) return "Unknown Class";
  const className = (result as { name: string }[])[0].name;
  return className;
}
