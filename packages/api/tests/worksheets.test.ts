import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { db } from "../src/db/client";
import {
  worksheets,
  worksheets_exercises,
  exercises,
  exercises_questions,
  questions,
} from "../src/db/schema";

beforeEach(async () => {
  // delete in FK order — fileParallelism is false so no race conditions with other test files
  await db.delete(worksheets_exercises);
  await db.delete(worksheets);
  await db.delete(exercises_questions);
  await db.delete(exercises);
  await db.delete(questions);
});

const validWorksheet = {
  title: "Grammar Basics",
  description: "A worksheet covering basic French grammar.",
  exercises: [] as string[],
};

async function createWorksheet(
  data: {
    title: string;
    description?: string;
    exercises: string[];
  } = validWorksheet,
) {
  const res = await app.request("/worksheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function createExercise() {
  const res = await app.request("/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "grammar", questions: [] }),
  });
  return res.json();
}

describe("GET /worksheets", () => {
  it("returns 200 with an empty array when no worksheets exist", async () => {
    const res = await app.request("/worksheets");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  it("returns 200 with all worksheets", async () => {
    await createWorksheet();

    const res = await app.request("/worksheets");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toHaveProperty("id");
    expect(json[0].title).toBe("Grammar Basics");
  });
});

describe("POST /worksheets", () => {
  it("returns 201 with a valid body", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWorksheet),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json.title).toBe("Grammar Basics");
    expect(json.description).toBe(validWorksheet.description);
  });

  it("returns 201 without description (optional field)", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No description", exercises: [] }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
  });

  it("returns 400 for an empty body", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 when title is missing", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "No title", exercises: [] }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for non-UUID exercise IDs", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", exercises: ["not-a-uuid"] }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 when exercise IDs dont exist", async () => {
    const res = await app.request("/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        exercises: ["00000000-0000-0000-0000-000000000000"],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("One or more exercise IDs do not exist");
  });
});

describe("GET /worksheets/:id", () => {
  it("returns 200 with the worksheet and nested exercises for a valid ID", async () => {
    const exercise = await createExercise();
    const created = await createWorksheet({
      title: "With Exercise",
      exercises: [exercise.id],
    });

    const res = await app.request(`/worksheets/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.title).toBe("With Exercise");
    expect(json).toHaveProperty("worksheets_exercises");
    expect(json.worksheets_exercises).toHaveLength(1);
    expect(json.worksheets_exercises[0].exercise.id).toBe(exercise.id);
  });

  it("returns nested exercises with their questions for the full chain", async () => {
    const questionRes = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "What is the French word for hello?",
        answer: "Bonjour",
        type: "mcq",
        options: { a: "Bonjour", b: "Au revoir" },
      }),
    });
    const question = await questionRes.json();

    const exerciseRes = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "grammar",
        questions: [question.id],
      }),
    });
    const exercise = await exerciseRes.json();

    const created = await createWorksheet({
      title: "Full Chain",
      exercises: [exercise.id],
    });

    const res = await app.request(`/worksheets/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.worksheets_exercises).toHaveLength(1);
    const nestedExercise = json.worksheets_exercises[0].exercise;
    expect(nestedExercise.id).toBe(exercise.id);
    expect(nestedExercise.exercises_questions).toHaveLength(1);
    expect(nestedExercise.exercises_questions[0].question.id).toBe(question.id);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/worksheets/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Worksheet ID does not exist");
  });

  it("returns 400 for a non-UUID string", async () => {
    const res = await app.request("/worksheets/not-a-valid-uuid");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });
});

describe("PUT /worksheets/:id", () => {
  it("returns 200 with updated fields for a valid request", async () => {
    const created = await createWorksheet();

    const res = await app.request(`/worksheets/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated Title",
        description: "Updated description.",
        exercises: [],
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.title).toBe("Updated Title");
    expect(json.description).toBe("Updated description.");
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/worksheets/not-a-valid-uuid", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validWorksheet),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for an invalid body", async () => {
    const created = await createWorksheet();

    const res = await app.request(`/worksheets/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises: [] }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/worksheets/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validWorksheet),
      },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Worksheet ID does not exist");
  });

  it("returns 400 when exercise IDs do not exist", async () => {
    const created = await createWorksheet();

    const res = await app.request(`/worksheets/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        exercises: ["00000000-0000-0000-0000-000000000000"],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("One or more exercise IDs do not exist");
  });
});

describe("DELETE /worksheets/:id", () => {
  it("returns 204 for a valid existing ID", async () => {
    const created = await createWorksheet();

    const res = await app.request(`/worksheets/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);

    const check = await app.request(`/worksheets/${created.id}`);
    expect(check.status).toBe(404);
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/worksheets/not-a-valid-uuid", {
      method: "DELETE",
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/worksheets/00000000-0000-0000-0000-000000000000",
      { method: "DELETE" },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Worksheet ID does not exist");
  });
});
