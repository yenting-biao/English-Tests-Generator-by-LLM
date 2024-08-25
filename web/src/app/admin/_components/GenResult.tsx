"use client";

import {
  Form,
  FormControl,
  //  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { DeepPartial } from "@/lib/utils";
import {
  ReadingCompResult,
  saveReadingCompResultSchema,
} from "@/lib/validators/genQA";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2 } from "lucide-react";

export default function GenResult({
  passage,
  questions,
}: DeepPartial<ReadingCompResult>) {
  const path = usePathname();
  const testType = path.split("/")[2];
  const defaultTitle: {
    [key: string]: string;
  } = {
    "reading-comprehension": "Reading Comprehension",
    "listening-comprehension": "Listening Comprehension",
    cloze: "Cloze",
    "listening-cloze": "Listening Cloze",
  };

  const form = useForm<z.infer<typeof saveReadingCompResultSchema>>({
    resolver: zodResolver(saveReadingCompResultSchema),
    defaultValues: {
      title: defaultTitle[testType],
      passage: passage,
      questions: questions,
    },
  });
  useEffect(() => {
    form.reset({
      title: defaultTitle[testType],
      passage: passage,
      questions: questions,
    });
  }, [passage, questions]);

  const passageRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (passageRef.current) {
      passageRef.current.scrollTop = passageRef.current.scrollHeight;
    }
  }, [passage]);

  const onSubmit = async (
    values: z.infer<typeof saveReadingCompResultSchema>
  ) => {
    console.log(values);
  };

  return (
    <div className="space-y-2">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
        The Generated Test:
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 max-w-3xl w-full"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-bold">Test Title</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-bold">Passage</FormLabel>
                <Textarea
                  {...field}
                  defaultValue={passage}
                  ref={passageRef}
                  className="min-h-96  whitespace-pre-wrap"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <QuestionsField form={form} />
          <Button type="submit" className="w-fit mt-5">
            Save the test to library
          </Button>
        </form>
      </Form>
    </div>
  );
}

function QuestionsField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof saveReadingCompResultSchema>>;
}) {
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray<z.infer<typeof saveReadingCompResultSchema>>({
    control: form.control,
    name: "questions",
  });

  const qRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (qRef.current) {
      qRef.current.scrollTop = qRef.current.scrollHeight;
    }
  }, [questionFields, form]);

  return (
    <div className="">
      <h2 className="text-xl font-bold">Questions</h2>
      <div
        className="space-y-2 mt-3 border px-3 pb-3 min-h-96 max-h-[85dvh] overflow-auto"
        ref={qRef}
      >
        <div className="space-y-3">
          {questionFields?.map((question, questionIndex) => (
            <div key={question.id} className="py-3">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.question`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormLabel className="text-xl font-bold">
                        Question {questionIndex + 1}
                      </FormLabel>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this question?"
                            )
                          ) {
                            removeQuestion(questionIndex);
                          }
                        }}
                        className="hover:text-red-500"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                    <Textarea {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <OptionsField form={form} questionIndex={questionIndex} />
            </div>
          ))}
        </div>
        {questionFields.length > 0 && (
          <div className="w-full flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                appendQuestion({ question: "", options: [] });
              }}
              className="w-fit mt-5 border-foreground"
            >
              <PlusCircle size={20} className="mr-2" />
              Add Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionsField({
  form,
  questionIndex,
}: {
  form: UseFormReturn<z.infer<typeof saveReadingCompResultSchema>>;
  questionIndex: number;
}) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options` as `questions.0.options`,
  });
  return (
    <div className="mt-1 space-y-2">
      {optionFields?.map((option, optionIndex) => (
        <div key={option.id} className="w-full flex items-center gap-2">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.options.${optionIndex}.option`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <div className="flex items-center gap-2">
                  <FormLabel>
                    ({String.fromCharCode(65 + optionIndex)})
                  </FormLabel>
                  <Input {...field} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.options.${optionIndex}.correct`}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>ans</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this option?")
              ) {
                removeOption(optionIndex);
              }
            }}
            className="hover:text-red-500 ml-3"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          appendOption({ option: "", correct: false });
        }}
        className="w-fit hover:border-foreground hover:bg-transparent"
      >
        <PlusCircle size={20} className="mr-2" />
        Add Option
      </Button>
    </div>
  );
}
