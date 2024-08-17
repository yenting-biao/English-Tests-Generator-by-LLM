import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user) redirect("/admin/login");

  return (
    <div className="my-auto w-full">
      <h5 className="text-2xl text-center font-medium mt-20">
        Select the type of test you want to generate.
      </h5>
      <div className="max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 mx-auto">
        <StyledLink href="/admin/reading-comprehension">
          Reading Comprehension
        </StyledLink>
        <StyledLink href="/admin/listening-comprehension">
          Listening Comprehension
        </StyledLink>
        <StyledLink href="/admin/cloze">Cloze</StyledLink>
        <StyledLink href="/admin/listening-cloze">Listening Cloze</StyledLink>
      </div>
    </div>
  );
}

function StyledLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "p-5 border-4 rounded-xl text-center text-lg md:text-xl font-semibold tracking-tight first:mt-0 hover:bg-secondary whitespace-nowrap",
        className
      )}
    >
      {children}
    </Link>
  );
}
