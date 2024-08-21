import z from "zod";

export const addClassToTestSchema = z.object({
  classNumber: z.number(),
  showAnswer: z.boolean(),
  startTimeStamp: z.string(),
  endTimeStamp: z.string(),
});

export const extendAddClassToTestSchema = addClassToTestSchema.extend({
  testId: z.string(),
});
