import z from "zod";

// genQA input form
const baseSchema = z.object({
  difficulty: z
    .number()
    .int()
    .min(1, {
      message: "Difficulty must be at least 1.",
    })
    .max(6, {
      message: "Difficulty must be at most 6.",
    }),
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
    // .min(50, {
    //   message: "The examples you provided are too short.",
    // })
    .max(100000, {
      message:
        "The examples you provided are too long. It should be less than 100,000 characters.",
    }),
});

export const readingComprehensionSchema = baseSchema.extend({
  questionTypes: z.array(z.number().int()),
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
});

export const listeningComprehensionSchema = baseSchema.extend({
  questionTypes: z.array(z.number().int()),
  url: z.string().url({ message: "Please provide a valid URL." }),
});

export const clozeTestSchema = baseSchema;

export const listeningClozeSchema = z.object({
  numBlanks: z.number().int().min(1).max(20).or(z.string().min(1).max(20)),
  transcript: z.string().optional(),
  audioFile: z.any().optional(),
});

// genQA results
const questionSchema = z.object({
  id: z.string().optional(), // for db update
  question: z.string(),
  options: z.array(
    z.object({
      id: z.string().optional(), // for db update
      option: z.string(),
      correct: z.boolean(),
    })
  ),
});
// answer: z.number().int(), // index of the correct answer
// the answer field is because gpt's output...

export const readingCompResultSchema = z.object({
  passage: z.string(),
  questions: z.array(questionSchema),
});

export const listeningCompResultSchema = z.object({
  questions: z.array(questionSchema),
});

export const saveReadingCompResultSchema = readingCompResultSchema.extend({
  title: z.string().min(1).max(100),
});

export const saveListeningCompResultSchema = listeningCompResultSchema.extend({
  title: z.string().min(1).max(100),
});

export type SaveReadingCompResult = z.infer<typeof saveReadingCompResultSchema>;

export type ReadingCompResult = z.infer<typeof readingCompResultSchema>;

export type Question = z.infer<typeof questionSchema>;
