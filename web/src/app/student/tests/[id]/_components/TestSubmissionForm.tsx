"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { studentSubmitTestSchema as formSchema } from "@/lib/validators/studentTest";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { MultipleChoiceQuestion } from "./action";

const submitTestResponseSchema = z.object({
  showAnswers: z.boolean(),
  answers: z.array(z.string()),
});

type TestSubmissionFormProps = {
  questions: MultipleChoiceQuestion[];
  testId: string;
  disable: boolean;
  submittedAnswers?: string[];
};

export default function TestSubmissionForm({
  questions,
  testId,
  disable,
  submittedAnswers,
}: TestSubmissionFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: submittedAnswers,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (
      !window.confirm(
        "You cannot change your answers after submitting. Are you sure you want to submit?"
      )
    ) {
      return;
    }
    console.log("values", values);
    return;

    try {
      const response = await fetch(`/api/student/test/${testId}`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const httpStatus = response.status;
        const body = await response.json();
        if (httpStatus === 400 || httpStatus === 404) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              body.error ??
              "Please make sure you have filled all the blanks, you have not submitted the test already, and the deadline has not passed.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "An error occurred while submitting your test. Please try again later.",
          });
        }
        return;
      }

      const data = await response.json();
      const validatedData = submitTestResponseSchema.safeParse(data);
      if (!validatedData.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "An error occurred while parsing the response sent by the server.",
        });
        return;
      }

      if (validatedData.data.showAnswers) {
        const answers = validatedData.data.answers;
        toast({
          variant: "default",
          title: "Test submitted successfully!",
          description: `Correct answers: ${answers.join(", ")}`,
        });
      } else {
        toast({
          variant: "default",
          title: "Test submitted successfully!",
          description:
            "Answers of this test are hidden. Please wait for the instructor to reveal them.",
        });
      }

      router.refresh();
    } catch (error) {
      console.error("error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "An error occurred while submitting your test. Please try again later.",
      });
    }
  };

  return (
    <Form {...form}>
      <Toaster />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {questions.map((question, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`answers.${index}`}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-bold">
                  {index + 1}. {question.question}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {question.options.map((option, optionIndex) => (
                      <FormItem
                        key={optionIndex}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.id} />
                        </FormControl>
                        <FormLabel className="font-normal text-base">
                          ({String.fromCharCode(65 + optionIndex)}){" "}
                          {option.option}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" disabled={disable}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
