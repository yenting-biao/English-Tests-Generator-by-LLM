"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { readingComprehensionSchema as formSchema } from "@/lib/validators/genQA";
import { questionTypes } from "@/lib/constants/questionTypes";
import React from "react";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submit: (input: any) => void;
  isLoading: boolean;
};

export default function ReadingForm({ submit, isLoading }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 4,
      passageLength: 300,
      topic: "",
      numQuestions: 4,
      numOptions: 4,
      questionTypes: [],
      examples: "",
    },
  });
  const { toast } = useToast();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      submit(values);
    } catch (error) {
      console.error(
        "An error occurred when submitting request and streaming: " + error
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid md:grid-cols-2 gap-4 max-w-3xl w-full"
      >
        <DifficultyField form={form} />
        <PassageLengthField form={form} />
        <NumQuestionsField form={form} />
        <NumOptionsField form={form} />
        <div className="md:col-span-2">
          <QuestionTypesField form={form} />
        </div>
        <div className="md:col-span-2">
          <TopicField form={form} />
        </div>
        <div className="md:col-span-2">
          <ExamplesField form={form} />
        </div>
        <Button
          type="submit"
          className="w-fit md:col-span-2 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Generate!
        </Button>
      </form>
    </Form>
  );
}

function DifficultyField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return (
    <FormField
      control={form.control}
      name="difficulty"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Difficulty</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the difficulty of the problems." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  CEFR {CEFR[i]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the difficulty of the problems.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function PassageLengthField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="passageLength"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Passage Length</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the length of the passage." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={(100 * (i + 1)).toString()}>
                  {100 * (i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Select the length of the passage.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TopicField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="topic"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Topic</FormLabel>
          <Input {...field} />
          <FormDescription>
            Enter the topic of the passage, or leave it blank for a random
            topic.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumQuestionsField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="numQuestions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Number of Questions</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the number of questions." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the number of questions to generate.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumOptionsField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="numOptions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Number of Options</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the number of options." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 3 }, (_, i) => (
                <SelectItem key={i} value={(i + 3).toString()}>
                  {i + 3}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the number of options for each question.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function QuestionTypesField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="questionTypes"
      render={() => (
        <FormItem>
          <div className="mb-2">
            <FormLabel>Question Types</FormLabel>
            <FormDescription>
              Select the types of questions you want to generate.
            </FormDescription>
          </div>
          <div className="space-y-3">
            {questionTypes.map((value, i) => (
              <FormField
                key={i}
                control={form.control}
                name="questionTypes"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={i}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(i)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, i])
                              : field.onChange(
                                  field.value?.filter((value) => value !== i)
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{value}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ExamplesField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="examples"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Examples</FormLabel>
          <Textarea
            placeholder=""
            className="resize-none md:resize-y h-60"
            {...field}
          />
          <FormDescription>
            Enter some (3-5) examples of reading comprehension problems so that
            LLMs can learn from them. Please separate each example with a
            newline.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
