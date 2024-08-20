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
        Generate new tests:
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
      <h5 className="text-2xl text-center font-medium mt-20">Manage tests:</h5>
      <div className="mx-auto mt-10 text-center">
        <Link
          href="/admin/test-manage"
          className="p-5 border-4 rounded-xl text-center text-lg md:text-xl font-semibold tracking-tight first:mt-0 hover:bg-secondary whitespace-nowrap"
        >
          Manage Saved Tests and Publish to Class
        </Link>
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
