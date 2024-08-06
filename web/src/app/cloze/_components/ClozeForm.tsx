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
import { clozeTestSchema as formSchema } from "@/lib/validators/genQA";
import React from "react";

export function ClozeForm({
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
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 4,
      numQuestions: 5,
      numOptions: 4,
      examples: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // The form values are type-safe and validated.
    setStreaming(true);

    try {
      const res = await fetch("/api/cloze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (res.status === 400) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            "Please make sure you provided a valid Youtube link and the form is filled correctly.",
          duration: 3000,
        });
        return;
      } else if (!res.ok || !res.body) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            "Failed to generate questions due to server error. Please try again later.",
          duration: 3000,
        });
        return;
      }

      setResult("");
      resultRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest",
      });

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
        <DifficultyField form={form} />
        <NumQuestionsField form={form} />
        <NumOptionsField form={form} />
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
          <FormLabel>Number of Blanks</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select the number of blanks." />
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
            Select the number of blanks in the passage.
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
            Enter some (3-5) examples of the cloze tests so that LLMs can learn
            from them. Please separate each example with a newline.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
