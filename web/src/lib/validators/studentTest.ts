import z from "zod";

export const studentSubmitTestFormSchema = z.object({
  answers: z.array(z.string().min(1, "This field is required")),
});

export const studentSubmitTestAPISchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      chosenOptionId: z.string().min(1, "This field is required"),
    })
  ),
});
