import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <div className="my-auto w-full">
      <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight leading-relaxed lg:text-6xl text-center">
        English Problems Generator
      </h1>
      <div className="max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 mx-auto">
        <StyledLink href="/reading-comprehension">
          Reading Comprehension
        </StyledLink>
        <StyledLink href="/listening-test">Listening Test</StyledLink>
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
        "p-5 border-4 rounded-xl text-center text-lg md:text-xl font-semibold tracking-tight first:mt-0 hover:bg-secondary",
        className
      )}
    >
      {children}
    </Link>
  );
}
