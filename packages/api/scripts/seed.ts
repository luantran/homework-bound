import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";

const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Clearing database...");

  await db.delete(schema.worksheets_exercises);
  await db.delete(schema.worksheets);
  await db.delete(schema.exercises_questions);
  await db.delete(schema.exercises);
  await db.delete(schema.questions);

  console.log("Database cleared. Seeding...");

  const now = new Date();

  const insertedQuestions = await db
    .insert(schema.questions)
    .values([
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Quel est le pluriel de 'cheval'?",
        hint: "Pensez aux animaux",
        answer: "b",
        type: "mcq",
        options: { A: "chevals", B: "chevaux", C: "chevales", D: "cheval" },
        tags: ["grammar.noms"],
        min_level: 3,
        max_level: 5,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Je ___ (aller) à l'école tous les jours.",
        hint: "Conjuguez au présent",
        answer: "vais",
        type: "fill_in_gap",
        tags: ["conjugaison.présent"],
        min_level: 3,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Décrivez votre journée typique en 3 phrases.",
        answer: "open-ended",
        type: "short_answer",
        tags: ["reading.réaction"],
        min_level: 5,
        max_level: 7,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Quel est le féminin de 'beau'?",
        hint: "Pensez à l'adjectif",
        answer: "b",
        type: "mcq",
        options: { A: "beaue", B: "belle", C: "beau", D: "beaux" },
        tags: ["grammar.adjectifs"],
        min_level: 4,
        max_level: 6,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Nous ___ (finir) nos devoirs avant le dîner.",
        hint: "Conjuguez au présent",
        answer: "finissons",
        type: "fill_in_gap",
        tags: ["conjugaison.présent"],
        min_level: 4,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Quel est le contraire de 'grand'?",
        answer: "b",
        type: "mcq",
        options: { A: "gros", B: "petit", C: "long", D: "haut" },
        tags: ["grammar.adjectifs"],
        min_level: 2,
        max_level: 4,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Elle ___ (être) très contente aujourd'hui.",
        hint: "Conjuguez au présent",
        answer: "est",
        type: "fill_in_gap",
        tags: ["conjugaison.être", "conjugaison.présent"],
        min_level: 3,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Décrivez votre animal préféré en 2 phrases.",
        answer: "open-ended",
        type: "short_answer",
        tags: ["reading.réaction"],
        min_level: 4,
        max_level: 6,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Quel est le pluriel de 'oeil'?",
        hint: "Pluriel irrégulier",
        answer: "c",
        type: "mcq",
        options: { A: "oeils", B: "oeilles", C: "yeux", D: "oeilx" },
        tags: ["grammar.noms"],
        min_level: 4,
        max_level: 6,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        prompt: "Ils ___ (avoir) beaucoup de devoirs ce soir.",
        hint: "Conjuguez au présent",
        answer: "ont",
        type: "fill_in_gap",
        tags: ["conjugaison.avoir", "conjugaison.présent"],
        min_level: 3,
      },
    ])
    .returning();

  console.log(`Inserted ${insertedQuestions.length} questions`);

  const insertedExercises = await db
    .insert(schema.exercises)
    .values([
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        category: "grammar",
        prompt: "Choisissez le bon pluriel pour chaque nom.",
        context: "Les pluriels irréguliers en français.",
        tags: ["grammar.noms"],
        min_level: 3,
        max_level: 5,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        category: "conjugaison",
        prompt:
          "Conjuguez les verbes entre parenthèses au présent de l'indicatif.",
        context: "Conjugaison des verbes du 2ème groupe au présent.",
        tags: ["conjugaison.présent"],
        min_level: 4,
        max_level: 6,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        category: "grammar",
        prompt: "Choisissez la bonne forme de l'adjectif selon le contexte.",
        context: "Les adjectifs qualificatifs et leurs formes.",
        tags: ["grammar.adjectifs"],
        min_level: 4,
        max_level: 7,
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        category: "reading",
        prompt: "Répondez aux questions en utilisant des phrases complètes.",
        context: "Expression écrite — décrire des sujets du quotidien.",
        tags: ["reading.réaction"],
        min_level: 5,
        max_level: 8,
      },
    ])
    .returning();

  console.log(`Inserted ${insertedExercises.length} exercises`);

  await db.insert(schema.exercises_questions).values([
    {
      exercise_id: insertedExercises[0].id,
      question_id: insertedQuestions[0].id,
      order: 1,
    },
    {
      exercise_id: insertedExercises[0].id,
      question_id: insertedQuestions[8].id,
      order: 2,
    },
    {
      exercise_id: insertedExercises[1].id,
      question_id: insertedQuestions[1].id,
      order: 1,
    },
    {
      exercise_id: insertedExercises[1].id,
      question_id: insertedQuestions[4].id,
      order: 2,
    },
    {
      exercise_id: insertedExercises[1].id,
      question_id: insertedQuestions[6].id,
      order: 3,
    },
    {
      exercise_id: insertedExercises[1].id,
      question_id: insertedQuestions[9].id,
      order: 4,
    },
    {
      exercise_id: insertedExercises[2].id,
      question_id: insertedQuestions[3].id,
      order: 1,
    },
    {
      exercise_id: insertedExercises[2].id,
      question_id: insertedQuestions[5].id,
      order: 2,
    },
    {
      exercise_id: insertedExercises[3].id,
      question_id: insertedQuestions[2].id,
      order: 1,
    },
    {
      exercise_id: insertedExercises[3].id,
      question_id: insertedQuestions[7].id,
      order: 2,
    },
  ]);

  console.log("Linked questions to exercises");

  const insertedWorksheets = await db
    .insert(schema.worksheets)
    .values([
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        title: "Feuille de travail - Grammaire 1",
        description: "Pluriels irréguliers et adjectifs qualificatifs.",
      },
      {
        created_by: SEED_USER_ID,
        updated_at: now,
        title: "Feuille de travail - Conjugaison et Expression",
        description: "Conjugaison au présent et expression écrite.",
      },
    ])
    .returning();

  console.log(`Inserted ${insertedWorksheets.length} worksheets`);

  await db.insert(schema.worksheets_exercises).values([
    {
      worksheet_id: insertedWorksheets[0].id,
      exercise_id: insertedExercises[0].id,
      order: 1,
    },
    {
      worksheet_id: insertedWorksheets[0].id,
      exercise_id: insertedExercises[2].id,
      order: 2,
    },
    {
      worksheet_id: insertedWorksheets[1].id,
      exercise_id: insertedExercises[1].id,
      order: 1,
    },
    {
      worksheet_id: insertedWorksheets[1].id,
      exercise_id: insertedExercises[3].id,
      order: 2,
    },
  ]);

  console.log("Linked exercises to worksheets");
  console.log("Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
