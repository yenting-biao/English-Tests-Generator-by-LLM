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
import { Checkbox } from "@/components/ui/checkbox";
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
import { GripVertical, PlusCircle, Trash2 } from "lucide-react";

// https://github.com/atlassian/react-beautiful-dnd/issues/2350
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function GenResult({
  passage,
  questions,
  isLoading,
}: DeepPartial<ReadingCompResult> & { isLoading: boolean }) {
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
    if (passageRef.current && isLoading) {
      passageRef.current.scrollTop = passageRef.current.scrollHeight;
    }
  }, [passage]);

  const onSubmit = async (
    values: z.infer<typeof saveReadingCompResultSchema>
  ) => {
    console.log(values);
    const tmp = values.questions[values.questions.length - 1].options.map(
      (o) => o.option
    );
    console.log(tmp);
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
          <QuestionsField form={form} isLoading={isLoading} />
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
  isLoading,
}: {
  form: UseFormReturn<z.infer<typeof saveReadingCompResultSchema>>;
  isLoading: boolean;
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
    if (qRef.current && isLoading) {
      qRef.current.scrollTop = qRef.current.scrollHeight;
    }
  }, [questionFields, form]);

  return (
    <div className="">
      <h2 className="text-xl font-bold">Questions</h2>
      <div className="space-y-2 mt-3 pb-3" ref={qRef}>
        <div className="space-y-3">
          {questionFields?.map((question, questionIndex) => (
            <div key={question.id} className="py-3">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.question`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormLabel className="text-base font-semibold">
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
    move: moveOption,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options` as `questions.0.options`,
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId !== source.droppableId &&
      destination.index === source.index
    )
      return;

    moveOption(source.index, destination.index);
  };

  return (
    <div className="mt-1 space-y-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`question-${questionIndex}-options`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {optionFields?.map((option, optionIndex) => (
                <Draggable
                  key={`question-${questionIndex}-options-${optionIndex}`}
                  draggableId={`question-${questionIndex}-options-${optionIndex}`}
                  index={optionIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-full flex items-center gap-2 mb-2"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical size={20} className="cursor-move" />
                      </div>
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.options.${optionIndex}.option`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <div className="flex items-center gap-2">
                              <FormLabel>
                                ({String.fromCharCode(65 + optionIndex)})
                              </FormLabel>
                              <Input
                                {...field}
                                value={option.option}
                                onChange={(e) => {
                                  const currentOptions = form.getValues(
                                    `questions.${questionIndex}.options`
                                  );
                                  currentOptions[optionIndex].option =
                                    e.target.value;
                                  form.setValue(
                                    `questions.${questionIndex}.options`,
                                    currentOptions
                                  );
                                }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.options.${optionIndex}.correct`}
                        render={() => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>ans</FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={option.correct}
                                  onCheckedChange={(checked) => {
                                    const currentOptions = form.getValues(
                                      `questions.${questionIndex}.options`
                                    );
                                    currentOptions[optionIndex].correct =
                                      Boolean(checked);
                                    form.setValue(
                                      `questions.${questionIndex}.options`,
                                      currentOptions
                                    );
                                  }}
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
                            window.confirm(
                              "Are you sure you want to delete this option?"
                            )
                          ) {
                            removeOption(optionIndex);
                          }
                        }}
                        className="hover:text-red-500 ml-3"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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
