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

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GripVertical, PlusCircle, Trash2 } from "lucide-react";

// https://github.com/atlassian/react-beautiful-dnd/issues/2350
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

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

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (formRef.current && isLoading) {
      formRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [passage]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [validatedValues, setValidatedValues] =
    useState<z.infer<typeof saveReadingCompResultSchema>>();
  const onSubmit = async (
    values: z.infer<typeof saveReadingCompResultSchema>
  ) => {
    console.log(values);
    setShowDialog(true);
    setValidatedValues(values);
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
          ref={formRef}
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
          {/* <div ref={passageScrollRef} /> */}
          <QuestionsField form={form} isLoading={isLoading} />
          <Button type="submit" className="w-fit mt-5">
            Save the test to library
          </Button>
          <SubmitDialog
            isOpen={showDialog}
            setOpen={setShowDialog}
            validatedValues={validatedValues}
          />
        </form>
      </Form>
    </div>
  );
}

function SubmitDialog({
  isOpen,
  setOpen,
  validatedValues,
}: {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  validatedValues?: z.infer<typeof saveReadingCompResultSchema>;
}) {
  if (!validatedValues) return null;
  const { title, passage, questions } = validatedValues;
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async () => {
    console.log("Saving the test to library...");
    console.log(validatedValues);

    try {
      const res = await fetch("/api/tests/reading-comp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedValues),
      });
      if (!res.ok) {
        const body = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: body.error,
        });
      } else {
        const body = await res.json();
        toast({
          variant: "default",
          title: "Success",
          description: "The test has been saved to the library.",
        });
        setOpen(false);
        router.push(`/admin/test/${body.testId}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while saving the test.",
      });
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90%] max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Save the test</DialogTitle>
          <DialogDescription>
            Below is the preview of test you are about to save. Are you sure you
            want to save it for future use?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <p className="mb-3">
              Below is what the students will see in the test:
            </p>
            <div className="border border-foreground rounded p-3 space-y-3">
              <div>
                <p className="font-bold text-lg mb-3">{title}</p>
                <div className="whitespace-pre-wrap text-justify">
                  {passage}
                </div>
              </div>
              <div>
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="py-3">
                    <p className="whitespace-pre-wrap text-justify">
                      {questionIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-1 mt-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2 whitespace-pre-wrap text-justify"
                        >
                          <div>({String.fromCharCode(65 + optionIndex)})</div>
                          <div>{option.option}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-3">
              Below is the answer key for the test. They will not be visible to
              the students.
            </p>
            <div className="border border-foreground rounded p-3">
              {questions
                .map((question) => {
                  // the index of the answer
                  const answer = question.options.find((o) => o.correct);
                  return answer
                    ? String.fromCharCode(65 + question.options.indexOf(answer))
                    : "N/A";
                })
                .join(", ")}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      qRef.current.scrollIntoView({ behavior: "auto", block: "end" });
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
          <div ref={qRef} />
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
