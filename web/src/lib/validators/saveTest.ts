import z from "zod";

export const readingCompSchema = z.object({
  title: z.string().min(1, "You have to provide a title."),
  passage: z.string().min(1, "You have to provide the passage and questions."),
  answers: z.array(
    z.object({ ans: z.string().min(1, "You have to select the answer.") })
  ),
});

// questions: z.array(
//   z.object({
//     question: z.string().min(1),
//     options: z.array(z.string().min(1)),
//     answer: z.string().min(1),
//   })
// ),
