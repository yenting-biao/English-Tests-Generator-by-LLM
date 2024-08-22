import z from "zod";

export const studentSubmitTestSchema = z.object({
  blanks: z.array(z.string().min(1, "This field is required")),
});
