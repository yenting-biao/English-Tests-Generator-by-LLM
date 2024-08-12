import { mysqlTable, smallint, text, varchar } from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from "uuid";

export const readingGenResultTable = mysqlTable("reading_comp", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  difficulty: smallint("difficulty").notNull(),
  numQuestions: smallint("num_questions").notNull(),
  numOptions: smallint("num_options").notNull(),
  numPassages: smallint("num_passages").notNull(),
  passageLength: smallint("passage_length").notNull(),
  topic: varchar("topic", { length: 100 }).default(""),
  examples: text("examples").default(""),
  generatedResult: text("generated_result").default(""),
});

export const readingQuestionTypesTable = mysqlTable("reading_qtypes", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  type: smallint("type").notNull(),
  generationId: varchar("generation_id", { length: 36 })
    .notNull()
    .references(() => readingGenResultTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const listeningGenResultTable = mysqlTable("listening_comp", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  url: text("url").notNull(),
  difficulty: smallint("difficulty").notNull(),
  numQuestions: smallint("num_questions").notNull(),
  numOptions: smallint("num_options").notNull(),
  examples: text("examples").default(""),
  transcription: text("transcription").default(""),
  generatedResult: text("generated_result").default(""),
});

export const listeningQuestionTypesTable = mysqlTable(
  "listening_comp_qtypes",
  {
    id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    type: smallint("type").notNull(),
    generationId: varchar("generation_id", { length: 36 })
      .notNull()
      .references(() => listeningGenResultTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  }
);

export const listeningClozeGenResultTable = mysqlTable(
  "listening_cloze",
  {
    id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    numBlanks: smallint("num_blanks").notNull(),
    transcript: text("transcript").notNull(),
    generatedResult: text("generated_result").default(""),
  }
);
