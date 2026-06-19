import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { db } from "../src/db/client";
import { exercises, questions, worksheets_exercises } from "../src/db/schema";

beforeEach(async () => {
  await db.delete(worksheets_exercises);
  await db.delete(questions);
  await db.delete(exercises);
});

async function createExercise() {
  const res = await app.request("/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category: "grammar", questions: [] }),
  });
  return res.json();
}

async function createQuestion(exercise_id: string) {
  const res = await app.request("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "What is the French word for hello?",
      answer: "Bonjour",
      type: "mcq",
      options: { A: "Bonjour", B: "Au revoir", C: "Merci", D: "Oui" },
      exercise_id,
    }),
  });
  return res.json();
}

const validQuestion = {
  prompt: "What is the French word for hello?",
  answer: "Bonjour",
  type: "mcq",
  options: { A: "Bonjour", B: "Au revoir", C: "Merci", D: "Oui" },
};

describe("GET /questions", () => {
  it("returns 200 with an empty array when no questions exist", async () => {
    const res = await app.request("/questions");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  it("returns 200 with all questions", async () => {
    const exercise = await createExercise();
    await createQuestion(exercise.id);

    const res = await app.request("/questions");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toHaveProperty("id");
    expect(json[0].prompt).toBe(validQuestion.prompt);
  });
});

describe("GET /questions/:id", () => {
  it("returns 200 with the question for a valid existing ID", async () => {
    const exercise = await createExercise();
    const created = await createQuestion(exercise.id);

    const res = await app.request(`/questions/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.prompt).toBe(validQuestion.prompt);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/questions/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Question ID does not exist");
  });

  it("returns 400 for a non-UUID string", async () => {
    const res = await app.request("/questions/not-a-valid-uuid");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });
});

describe("POST /questions", () => {
  it("returns 201 with a valid body", async () => {
    const exercise = await createExercise();
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validQuestion, exercise_id: exercise.id }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json.prompt).toBe(validQuestion.prompt);
    expect(json.type).toBe("mcq");
  });

  it("returns 201 without hint and options (optional fields)", async () => {
    const exercise = await createExercise();
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Fill in the blank: Je ___ français.",
        answer: "parle",
        type: "fill_in_gap",
        exercise_id: exercise.id,
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
  });

  it("returns 400 for an empty body", async () => {
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 when prompt is missing", async () => {
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: "Bonjour", type: "mcq" }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for an invalid type", async () => {
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Test",
        answer: "Test",
        type: "not-a-real-type",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const res = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid JSON body");
  });
});

describe("PUT /questions/:id", () => {
  it("returns 200 with updated fields for a valid request", async () => {
    const exercise = await createExercise();
    const created = await createQuestion(exercise.id);

    const res = await app.request(`/questions/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Updated prompt.",
        answer: "Updated answer.",
        type: "short_answer",
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.prompt).toBe("Updated prompt.");
    expect(json.type).toBe("short_answer");
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/questions/not-a-valid-uuid", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validQuestion),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for an invalid body", async () => {
    const exercise = await createExercise();
    const created = await createQuestion(exercise.id);

    const res = await app.request(`/questions/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "not-real-type" }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/questions/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validQuestion),
      },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Question ID does not exist");
  });
});

describe("DELETE /questions/:id", () => {
  it("returns 204 for a valid existing ID", async () => {
    const exercise = await createExercise();
    const created = await createQuestion(exercise.id);

    const res = await app.request(`/questions/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);

    // confirm it no longer exists
    const check = await app.request(`/questions/${created.id}`);
    expect(check.status).toBe(404);
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/questions/not-a-valid-uuid", {
      method: "DELETE",
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/questions/00000000-0000-0000-0000-000000000000",
      { method: "DELETE" },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Question ID does not exist");
  });
});
