"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck2, CheckCheck, CircleAlert } from "lucide-react";
import Link from "next/link";

type TestPreviewProps = {
  id: string;
  name: string;
  description: string;
  submitted: boolean;
  startTimestamp: string;
  endTimestamp: string;
};

export default function TestPreview({
  id,
  name,
  description,
  submitted,
  startTimestamp,
  endTimestamp,
}: TestPreviewProps) {
  const formattedTimeStamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "numeric",
      hour12: false,
    });
  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          <CalendarCheck2 className="inline-block mr-2" size={16} />
          {formattedTimeStamp(startTimestamp)} -{" "}
          {formattedTimeStamp(endTimestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">{description}</CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        {submitted ? (
          <p className="text-green-600">
            <CheckCheck size={16} className="inline-block mr-1" />
            Submitted!
          </p>
        ) : (
          <p className="text-red-600">
            {" "}
            <CircleAlert size={16} className="inline-block mr-1" />
            Not submitted.
          </p>
        )}
        <Button
          className="px-4 p-2 disabled:cursor-not-allowed"
          asChild
          disabled={submitted}
        >
          <Link href={`\\tests\\${id}`}>Take the test.</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
