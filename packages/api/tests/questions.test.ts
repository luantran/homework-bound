import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { db } from "../src/db/client";
import { questions } from "../src/db/schema";

beforeEach(async () => {
  // wipe questions before each test so tests don't depend on each other
  await db.delete(questions);
});

const validQuestion = {
  prompt: "What is the French word for hello?",
  answer: "Bonjour",
  type: "mcq",
  options: { a: "Bonjour", b: "Au revoir", c: "Merci", d: "Oui" },
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
    // seed a question first via the API
    await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validQuestion),
    });

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
    // create a question and capture its ID
    const createRes = await app.request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validQuestion),
    });
    const created = await createRes.json();

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
    expect(json).toHaveProperty("error");
    expect(json.error).toBe("Question ID does not exist");
  });

  it("returns 400 for a non-UUID string", async () => {
    const res = await app.request("/questions/not-a-valid-uuid");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(Array.isArray(json.error)).toBe(true);
  });
});
