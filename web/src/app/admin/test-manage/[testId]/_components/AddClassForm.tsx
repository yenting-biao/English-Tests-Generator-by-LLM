"use client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { addClassToTestSchema } from "@/lib/validators/classTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { assignedTestsTableType } from "@/lib/types/db";

type AddClassFormProps = {
  notAssignedClassNumber: number[];
  classNameDict: { [key: number]: string };
  testId: string;
  assignedCls?: assignedTestsTableType;
};

export default function AddClassForm({
  notAssignedClassNumber,
  classNameDict,
  testId,
  assignedCls,
}: AddClassFormProps) {
  const form = useForm<z.infer<typeof addClassToTestSchema>>({
    resolver: zodResolver(addClassToTestSchema),
    defaultValues: {
      classNumber: assignedCls?.classNumber,
      showAnswer: assignedCls?.showAnswers || false,
      startTimeStamp: format(
        assignedCls?.startDate || new Date(),
        "yyyy-MM-dd'T'HH:mm"
      ),
      endTimeStamp: format(
        assignedCls?.endDate || new Date(),
        "yyyy-MM-dd'T'HH:mm"
      ),
    },
  });
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof addClassToTestSchema>) => {
    values.startTimeStamp = new Date(values.startTimeStamp).toISOString();
    values.endTimeStamp = new Date(values.endTimeStamp).toISOString();
    if (values.startTimeStamp >= values.endTimeStamp) {
      form.setError("startTimeStamp", {
        type: "manual",
        message: "Start time must be before the end time.",
      });
      form.setError("endTimeStamp", {
        type: "manual",
        message: "End time must be after the start time.",
      });
      return;
    }

    const res = await fetch("/api/tests/class", {
      method: assignedCls ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, testId }),
    });
    if (!res.ok) {
      const httpCode = res.status;
      if (httpCode === 403) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You are not authorized to perform this action.",
          duration: 3000,
        });
      } else if (httpCode == 400) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Invalid input. Please check the input fields and make sure you did not assign the same class to this test.",
          duration: 3000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Internal server error. Please try again later.",
          duration: 3000,
        });
      }
    } else {
      toast({
        title: "Success",
        description: "Class has been added to this test.",
        duration: 3000,
      });
    }
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-1">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="classNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class to assign this test." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {notAssignedClassNumber.map((clsId) => (
                      <SelectItem key={clsId} value={clsId.toString()}>
                        {classNameDict[clsId]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Show Answers</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Show Answer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Show answers to students after they submit the test.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTimeStamp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  {...field}
                  placeholder="Start Time"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTimeStamp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time (Deadline)</FormLabel>
                <Input
                  type="datetime-local"
                  {...field}
                  placeholder="End Time"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="mt-5">
          Assign
        </Button>
      </form>
    </Form>
  );
}
