import {
  boolean,
  mysqlTable,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from "uuid";

export const adminUserTable = mysqlTable("admin_user", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
});

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

// about the saved reading test
export const readingTestTable = mysqlTable("reading_test", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => adminUserTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: varchar("title", { length: 100 }).notNull(),
  passage: text("passage").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const multipleChoiceQuestionTable = mysqlTable(
  "multiple_choice_question",
  {
    id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    readingTestId: varchar("reading_test_id", { length: 36 })
      .notNull()
      .references(() => readingTestTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ind: smallint("ind").notNull().default(0),
    description: text("description").notNull(),
  }
);

export const optionsTable = mysqlTable("options", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  questionId: varchar("question_id", { length: 36 })
    .notNull()
    .references(() => multipleChoiceQuestionTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  ind: smallint("ind").notNull().default(0),
  option: text("option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
});

// the old test table
export const testsTable = mysqlTable("tests", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => adminUserTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: varchar("title", { length: 100 }).notNull(),
  questions: text("questions").notNull(),
  answers: text("answers").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// still useful
export const assignedTestsTable = mysqlTable("assigned_tests", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  testId: varchar("test_id", { length: 36 })
    .notNull()
    .references(() => testsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  classNumber: smallint("class_number").notNull(),
  showAnswers: boolean("show_answers").notNull().default(false),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const studentSubmittedQuestionsTable = mysqlTable(
  "student_submitted_questions",
  {
    id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
    studentId: varchar("student_id", { length: 36 }).notNull(),
    testId: varchar("test_id", { length: 36 })
      .notNull()
      .references(() => testsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    questionId: varchar("question_id", { length: 36 })
      .notNull()
      .references(() => multipleChoiceQuestionTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    chosenOptionId: varchar("chosen_option_id", { length: 36 })
      .notNull()
      .references(() => optionsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    submittedTimestamp: timestamp("submitted_timestamp").notNull().defaultNow(),
  }
);

export const submittedTestsTable = mysqlTable("submitted_test", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  studentId: varchar("student_id", { length: 36 }).notNull(),
  testId: varchar("test_id", { length: 36 })
    .notNull()
    .references(() => testsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  submittedAnswers: text("submitted_answers").notNull(),
  submittedTimestamp: timestamp("submitted_timestamp").notNull().defaultNow(),
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

export const listeningQuestionTypesTable = mysqlTable("listening_comp_qtypes", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  type: smallint("type").notNull(),
  generationId: varchar("generation_id", { length: 36 })
    .notNull()
    .references(() => listeningGenResultTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const listeningClozeGenResultTable = mysqlTable("listening_cloze", {
  id: varchar("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  numBlanks: smallint("num_blanks").notNull(),
  transcript: text("transcript").notNull(),
  generatedResult: text("generated_result").default(""),
});
