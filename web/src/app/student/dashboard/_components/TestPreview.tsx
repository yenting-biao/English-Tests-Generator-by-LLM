"use client";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck2, CircleAlert, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type TestPreviewProps = {
  id: string;
  name: string;
  submitted: boolean;
  startTimestamp: string;
  endTimestamp: string;
};

export default function TestPreview({
  id,
  name,
  submitted,
  startTimestamp,
  endTimestamp,
}: TestPreviewProps) {
  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle>{name}</CardTitle>
        <CardDescription className="pt-1">
          <CalendarCheck2 className="inline-block mr-2" size={16} />
          {format(new Date(startTimestamp), "yyyy-MM-dd HH:mm")} -{" "}
          {format(new Date(endTimestamp), "yyyy-MM-dd HH:mm")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between p-4 pt-0">
        {submitted ? (
          <p className="text-green-600">
            <CircleCheckBig size={16} className="inline-block mr-1" />
            Submitted!
          </p>
        ) : (
          <p className="text-red-600">
            {" "}
            <CircleAlert size={16} className="inline-block mr-1" />
            Not submitted.
          </p>
        )}
        <Link
          href={`\\student\\tests\\${id}`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "px-4 p-2"
            // (submitted || new Date() > new Date(endTimestamp)) &&
            //   "pointer-events-none opacity-50"
          )}
        >
          {submitted || new Date() > new Date(endTimestamp)
            ? "View the test."
            : "Take the test."}
        </Link>
      </CardFooter>
    </Card>
  );
}
