export const UserRole = {
  Teacher: "teacher",
  Student: "student",
} as const;

export const ExerciseCategory = {
  Grammar: "grammar",
  Conjugaison: "conjugaison",
  Reading: "reading",
} as const;

export const QuestionType = {
  MCQ: "mcq",
  Fill: "fill_in_gap",
  Short: "short_answer",
} as const;

export const SchoolLevel = {
  Primary1: 1,
  Primary2: 2,
  Primary3: 3,
  Primary4: 4,
  Primary5: 5,
  Primary6: 6,
  Secondary1: 7,
  Secondary2: 8,
  Secondary3: 9,
  Secondary4: 10,
  Secondary5: 11,
} as const;
