import { studentdb } from "@/db";

export async function getClassName(classNumber: number) {
  "use server";
  const [result] = await studentdb.query(
    "SELECT name FROM `FreshmanEnglish_group` WHERE `id` = ?",
    [classNumber]
  );
  const className = (result as { name: string }[])[0].name;
  return className;
}
