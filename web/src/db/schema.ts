import { pgTable, smallint, text, uuid, varchar } from "drizzle-orm/pg-core";

export const readingGenResultTable = pgTable("reading_gen_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  difficulty: smallint("difficulty").notNull(),
  numQuestions: smallint("num_questions").notNull(),
  numOptions: smallint("num_options").notNull(),
  numPassages: smallint("num_passages").notNull(),
  passageLength: smallint("passage_length").notNull(),
  topic: varchar("topic", { length: 100 }).default(""),
  examples: text("examples").default(""),
  generatedResult: text("generated_result").default(""),
});

export const readingQuestionTypesTable = pgTable("question_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: smallint("type").notNull(),
  generationId: uuid("generation_id")
    .notNull()
    .references(() => readingGenResultTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const listeningGenResultTable = pgTable("listening_gen_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  difficulty: smallint("difficulty").notNull(),
  numQuestions: smallint("num_questions").notNull(),
  numOptions: smallint("num_options").notNull(),
  examples: text("examples").default(""),
  transcription: text("transcription").default(""),
  generatedResult: text("generated_result").default(""),
});

export const listeningQuestionTypesTable = pgTable("listening_question_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: smallint("type").notNull(),
  generationId: uuid("generation_id")
    .notNull()
    .references(() => listeningGenResultTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const listeningClozeGenResultTable = pgTable(
  "listening_cloze_gen_result",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    numBlanks: smallint("num_blanks").notNull(),
    transcript: text("transcript").notNull(),
    generatedResult: text("generated_result").default(""),
  }
);
