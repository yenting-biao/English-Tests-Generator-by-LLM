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

const formSchema = z.object({
  difficulty: z
    .number()
    .int()
    .min(1, {
      message: "Difficulty must be at least 1.",
    })
    .max(5, {
      message: "Difficulty must be at most 5.",
    }),
  passageLength: z
    .number()
    .int()
    .min(100, {
      message: "Length must be at least 100.",
    })
    .max(1000, {
      message: "Length must be at most 1000.",
    }),
  topic: z
    .string()
    .max(50, {
      message: "Topic must be at most 50 characters.",
    })
    .optional(),
  numQuestions: z
    .number()
    .int()
    .min(1, {
      message: "Number of questions must be at least 1.",
    })
    .max(10, {
      message: "Number of questions must be at most 10.",
    }),
  numOptions: z
    .number()
    .int()
    .min(3, {
      message: "Number of options must be at least 2.",
    })
    .max(5, {
      message: "Number of options must be at most 5.",
    }),
  examples: z
    .string()
    .min(50, {
      message: "The examples you provided are too short.",
    })
    .max(10000, {
      message: "The examples you provided are too long.",
    }),
});

export function GenQAForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 3,
      passageLength: 300,
      topic: "",
      numQuestions: 4,
      numOptions: 4,
      examples: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
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
          <TopicField form={form} />
        </div>
        <div className="md:col-span-2">
          <ExamplesField form={form} />
        </div>
        <Button type="submit" className="w-fit md:col-span-2">
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
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1}
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
