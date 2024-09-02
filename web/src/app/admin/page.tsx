import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { privateEnv } from "@/lib/validators/env";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    session.user.username !== privateEnv.ADMIN_USERNAME
  )
    redirect("/admin/login");

  return (
    <div className="my-auto w-full">
      <h5 className="text-2xl text-center font-medium mt-20">
        Generate new tests:
      </h5>
      <div className="max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 mx-auto">
        <StyledLink href="/admin/generation/reading-comprehension">
          Reading Comprehension
        </StyledLink>
        <StyledLink href="/admin/generation/listening-comprehension">
          Listening Comprehension
        </StyledLink>
        <StyledLink href="/admin/generation/cloze">Cloze</StyledLink>
        <StyledLink href="/admin/generation/listening-cloze">
          Listening Cloze
        </StyledLink>
      </div>
      <h5 className="text-2xl text-center font-medium mt-20">Manage tests:</h5>
      <div className="mx-auto mt-10 text-center flex flex-col gap-6 w-fit">
        <StyledLink href="/admin/manage/test">
          Manage Saved Tests and Publish to Class
        </StyledLink>
        <StyledLink href="/admin/manage/class">
          Examine Class Details (coming soon)
        </StyledLink>
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
