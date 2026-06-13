export const UserRole = {
  Teacher: "teacher",
  Student: "student",
} as const;

export const ExerciseCategory = {
  Grammar: "grammar",
  Conjugaison: "conjugaison",
  Reading: "reading",
} as const;

export const ExerciseCategoryValues = Object.values(ExerciseCategory) as [
  string,
  ...string[],
];

export const QuestionType = {
  MCQ: "mcq",
  Fill: "fill_in_gap",
  Short: "short_answer",
} as const;

export const QuestionTypeValues = Object.values(QuestionType) as [
  string,
  ...string[],
];

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

export const SchoolLevelValues = Object.fromEntries(
  Object.entries(SchoolLevel).map(([key, val]) => [
    val,
    key.replace(/(\d+)/, " $1"),
  ]),
) as Record<number, string>;

export const QuestionCategory = {
  Grammar: "grammar",
  Conjugaison: "conjugaison",
  Reading: "reading",
} as const;

export const QuestionCategoryValues = Object.values(QuestionCategory) as [
  string,
  ...string[],
];

export const QuestionSubCategory: Record<string, readonly string[]> = {
  [QuestionCategory.Grammar]: [
    "noms",
    "adjectifs",
    "déterminants",
    "pronoms",
    "verbe",
    "prépositions",
    "conjonctions",
    "groupe sujet",
    "groupe verbal",
    "complément direct",
    "complément indirect",
    "complément de phrase",
  ],
  [QuestionCategory.Conjugaison]: [
    "présent",
    "être",
    "avoir",
    "passé composé",
    "futur proche",
    "futur simple",
    "imparfait",
    "conditionnel présent",
    "plus-que-parfait",
    "passé simple",
  ],
  [QuestionCategory.Reading]: [
    "compréhension",
    "interprétation",
    "réaction",
    "jugement",
  ],
};
