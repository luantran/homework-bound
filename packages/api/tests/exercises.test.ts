import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { db } from "../src/db/client";
import { exercises, exercises_questions, questions } from "../src/db/schema";

beforeEach(async () => {
  // delete in FK order to avoid constraint violations
  await db.delete(exercises_questions);
  await db.delete(exercises);
  await db.delete(questions);
});

const validExercise = {
  category: "grammar",
  context: "This exercise covers basic grammar rules.",
  questions: [] as string[],
};

async function createExercise(data = validExercise) {
  const res = await app.request("/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

describe("GET /exercises", () => {
  it("returns 200 with an empty array when no exercises exist", async () => {
    const res = await app.request("/exercises");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  it("returns 200 with all exercises", async () => {
    await createExercise();

    const res = await app.request("/exercises");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0]).toHaveProperty("id");
    expect(json[0].category).toBe("grammar");
  });
});

describe("POST /exercises", () => {
  it("returns 201 with a valid body", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validExercise),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json.category).toBe("grammar");
    expect(json.context).toBe(validExercise.context);
  });

  it("returns 201 without context (optional field)", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "reading", questions: [] }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
  });

  it("returns 400 for an empty body", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 when category is missing", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: "Some context.", questions: [] }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for an invalid category", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "not-a-real-category",
        questions: [],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for non-UUID question IDs", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "grammar",
        questions: ["not-a-uuid"],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 when question IDs do not exist", async () => {
    const res = await app.request("/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "grammar",
        questions: ["00000000-0000-0000-0000-000000000000"],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("One or more question IDs do not exist");
  });
});

describe("GET /exercises/:id", () => {
  it("returns 200 with the exercise for a valid existing ID", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.category).toBe("grammar");
  });

  it("returns nested questions when the exercise has questions", async () => {
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

    const created = await createExercise({
      category: "grammar",
      context: "Exercise with a question.",
      questions: [question.id],
    });

    const res = await app.request(`/exercises/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("exercises_questions");
    expect(json.exercises_questions).toHaveLength(1);
    expect(json.exercises_questions[0].question.id).toBe(question.id);
    expect(json.exercises_questions[0].question.prompt).toBe(
      "What is the French word for hello?",
    );
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/exercises/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Exercise ID does not exist");
  });

  it("returns 400 for a non-UUID string", async () => {
    const res = await app.request("/exercises/not-a-valid-uuid");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });
});

describe("PUT /exercises/:id", () => {
  it("returns 200 with updated fields for a valid request", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "reading",
        context: "Updated context.",
        questions: [],
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(created.id);
    expect(json.category).toBe("reading");
    expect(json.context).toBe("Updated context.");
  });

  it("returns 200 with an empty questions array", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "reading",
        context: "No questions.",
        questions: [],
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.category).toBe("reading");
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/exercises/not-a-valid-uuid", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validExercise),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 400 for an invalid body", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "not-real", questions: [] }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/exercises/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validExercise),
      },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Exercise ID does not exist");
  });

  it("returns 400 when question IDs do not exist", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "grammar",
        questions: ["00000000-0000-0000-0000-000000000000"],
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("One or more question IDs do not exist");
  });
});

describe("DELETE /exercises/:id", () => {
  it("returns 204 for a valid existing ID", async () => {
    const created = await createExercise();

    const res = await app.request(`/exercises/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);

    // confirm it no longer exists
    const check = await app.request(`/exercises/${created.id}`);
    expect(check.status).toBe(404);
  });

  it("returns 400 for a non-UUID ID", async () => {
    const res = await app.request("/exercises/not-a-valid-uuid", {
      method: "DELETE",
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(Array.isArray(json.error)).toBe(true);
  });

  it("returns 404 for a valid UUID that does not exist", async () => {
    const res = await app.request(
      "/exercises/00000000-0000-0000-0000-000000000000",
      { method: "DELETE" },
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Exercise ID does not exist");
  });
});
