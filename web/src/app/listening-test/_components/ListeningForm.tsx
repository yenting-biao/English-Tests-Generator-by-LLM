"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

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
import { listeningTestSchema as formSchema } from "@/lib/validators/genQA";
import { questionTypes } from "@/lib/constants/questionTypes";
import React from "react";

export function ListeningForm({
  setResult,
  streaming,
  setStreaming,
  resultRef,
}: {
  setResult: React.Dispatch<React.SetStateAction<string>>;
  streaming: boolean;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  resultRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 4,
      numQuestions: 4,
      numOptions: 4,
      questionTypes: [],
      examples: "",
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // The form values are type-safe and validated.
    setStreaming(true);
    setResult("");
    resultRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
      inline: "nearest",
    });

    try {
      const res = await fetch("/api/listening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (res.status === 400) {
        alert(
          "Some error occurred. Please check you provided a valid Youtube link and the form is filled correctly."
        );
        return;
      }
      if (!res.ok || !res.body) {
        alert(
          "Failed to generate questions due to server error. Please try again later."
        );
        return;
      }

      const reader = res.body.getReader();
      let count = 0;
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result += new TextDecoder().decode(value);
        setResult(result);
        count++;
        if (count > 2048) {
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setStreaming(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid md:grid-cols-2 gap-4 max-w-3xl w-full"
      >
        <UrlField form={form} />
        <DifficultyField form={form} />
        <NumQuestionsField form={form} />
        <NumOptionsField form={form} />
        <div className="md:col-span-2">
          <QuestionTypesField form={form} />
        </div>
        <div className="md:col-span-2">
          <ExamplesField form={form} />
        </div>
        <Button
          type="submit"
          className="w-fit md:col-span-2 disabled:cursor-not-allowed"
          disabled={streaming}
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

function UrlField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <FormField
      control={form.control}
      name="url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Youtube Link</FormLabel>
          <Input {...field} />
          <FormDescription>
            Enter the link of the Youtube video you want to generate questions.
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
      render={({ field }) => (
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
            Enter some (3-5) examples of the listening test problems so that
            LLMs can learn from them. Please separate each example with a
            newline.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
