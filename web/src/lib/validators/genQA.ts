import z from "zod";

export const genQASchema = z.object({
  numPassages: z
    .number()
    .int()
    .min(1, {
      message: "You have to generate at least 1 passage.",
    })
    .max(5, {
      message: "You can generate at most 5 passages.",
    }),
  difficulty: z
    .number()
    .int()
    .min(1, {
      message: "Difficulty must be at least 1.",
    })
    .max(6, {
      message: "Difficulty must be at most 6.",
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
    .max(100, {
      message: "Topic must be at most 100 characters.",
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
  questionTypes: z.array(z.number().int()),
  examples: z
    .string()
    // .min(50, {
    //   message: "The examples you provided are too short.",
    // })
    .max(100000, {
      message:
        "The examples you provided are too long. It should be less than 100,000 characters.",
    }),
});
