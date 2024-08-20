"use client";
import z from "zod";
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
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { readingCompSchema } from "@/lib/validators/saveTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleMinus, CirclePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export default function SavedTestForm() {
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

  const form = useForm<z.infer<typeof readingCompSchema>>({
    resolver: zodResolver(readingCompSchema),
    defaultValues: {
      title: defaultTitle[testType],
    },
  });

  const onSubmit = async (values: z.infer<typeof readingCompSchema>) => {
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "Failed to save the test due to server error. Please try again later.",
        duration: 3000,
      });
    } else {
      toast({
        variant: "default",
        title: "Test saved successfully!",
        description: "The test has been saved for future usage.",
        duration: 3000,
      });
    }
  };

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight py-6">
        Save the Generated Test and Publish to Students Later
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
                <FormLabel className="text-xl font-bold">
                  Passage and Questions
                </FormLabel>
                <FormDescription>
                  Note that this is what the students will see when they take
                  the test. You can copy the generated result above and paste it
                  here with some modifications. Just make sure the answers are
                  not included here.
                </FormDescription>
                <Textarea {...field} className="min-h-80" />
                <FormMessage />
              </FormItem>
            )}
          />
          <AnswersField form={form} />
          <Button type="submit" className="w-fit">
            Save to Library
          </Button>
        </form>
      </Form>
    </div>
  );
}

function AnswersField({
  form,
}: {
  form: UseFormReturn<z.infer<typeof readingCompSchema>>;
}) {
  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray<z.infer<typeof readingCompSchema>>({
    control: form.control,
    name: "answers",
  });
  return (
    <>
      <h4 className="text-xl font-bold">Answers</h4>
      <div className="flex flex-col gap-6">
        {answerFields.map((answer, answerIndex) => (
          <div key={answer.id} className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name={`answers.${answerIndex}.ans`}
              render={() => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-lg">
                      {answerIndex + 1}.
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        form.setValue(
                          `answers.${answerIndex}.ans`,
                          value as string
                        );
                      }}
                    >
                      <FormControl className="max-w-80">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => (
                          <SelectItem
                            key={i}
                            value={String.fromCharCode(65 + i)}
                          >
                            {String.fromCharCode(65 + i)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      className="text-destructive"
                      onClick={() => removeAnswer(answerIndex)}
                    >
                      <CircleMinus size={20} />
                    </button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <button
          type="button"
          className=""
          onClick={() => appendAnswer({ ans: "" })}
        >
          <CirclePlus size={20} />
        </button>
      </div>
    </>
  );
}

// function QuestionsField({
//   form,
//   questionFields,
//   appendQuestion,
//   removeQuestion,
// }: {
//   form: UseFormReturn<z.infer<typeof readingCompSchema>>;
//   questionFields: {
//     id: string;
//     question: string;
//     options: string[];
//   }[];
//   // eslint-disable-next-line no-unused-vars
//   appendQuestion: (question: {
//     question: string;
//     options: string[];
//     answer: string;
//   }) => void;
//   // eslint-disable-next-line no-unused-vars
//   removeQuestion: (index: number) => void;
// }) {
//   return (
//     <>
//       <h4 className="text-xl font-bold">Questions</h4>
//       <div className="flex flex-col gap-6">
//         {questionFields.map((question, questionIndex) => (
//           <div key={question.id} className="flex flex-col gap-2">
//             <FormField
//               control={form.control}
//               name={`questions.${questionIndex}.question`}
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="flex items-center gap-2">
//                     <FormLabel className="text-lg">
//                       Question {questionIndex + 1}
//                     </FormLabel>
//                     <button
//                       className="text-destructive"
//                       onClick={() => removeQuestion(questionIndex)}
//                     >
//                       <CircleMinus size={20} />
//                     </button>
//                   </div>
//                   <Textarea {...field} />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name={`questions.${questionIndex}.options`}
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="flex items-center gap-2 py-2">
//                     <FormLabel>Options</FormLabel>
//                     <button
//                       className="p-0 hover:bg-none"
//                       onClick={() =>
//                         form.setValue(`questions.${questionIndex}.options`, [
//                           ...field.value,
//                           "",
//                         ])
//                       }
//                     >
//                       <CirclePlus size={20} />
//                     </button>
//                   </div>
//                   {field.value.map((option: string, optionIndex: number) => (
//                     <div key={optionIndex} className="flex items-center gap-2">
//                       <Input
//                         {...form.register(
//                           `questions.${questionIndex}.options.${optionIndex}`
//                         )}
//                         className="flex-1"
//                       />
//                       <button
//                         onClick={() =>
//                           form.setValue(
//                             `questions.${questionIndex}.options`,
//                             field.value.filter(
//                               (_: string, i: number) => i !== optionIndex
//                             )
//                           )
//                         }
//                       >
//                         <CircleMinus size={20} />
//                       </button>
//                     </div>
//                   ))}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name={`questions.${questionIndex}.answer`}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Answer</FormLabel>
//                   <Input {...field} />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         ))}
//         <Button
//           variant="secondary"
//           className="w-fit"
//           onClick={() =>
//             appendQuestion({ question: "", options: [""], answer: "" })
//           }
//         >
//           Add Question
//         </Button>
//       </div>
//     </>
//   );
// }
