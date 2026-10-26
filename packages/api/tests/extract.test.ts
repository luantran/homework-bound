import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../src/app";
import { extractExercise } from "../src/services/extraction";
import { ExtractionFailedError, ExtractionRefusedError } from "../src/errors";
import { CreateExercise } from "@homework-bound/shared";

vi.mock("../src/services/extraction", () => ({ extractExercise: vi.fn() }));
const mockExtract = vi.mocked(extractExercise);

beforeEach(() => {
  mockExtract.mockReset();
});

const draft: CreateExercise = {
  category: "grammar",
  prompt: "Choisissez le bon pluriel.",
  questions: [
    {
      prompt: "Quel est le pluriel de 'cheval'?",
      type: "mcq",
      options: { A: "chevals", B: "chevaux" },
      answer: "",
    },
  ],
};

const png = (bytes = 10) =>
  new File([new Uint8Array(bytes)], "page.png", { type: "image/png" });

function upload(file?: File) {
  const form = new FormData();
  if (file) form.append("file", file);
  return app.request("/exercises/extract", { method: "POST", body: form });
}

describe("POST /exercises/extract", () => {
  it("returns 200 with the extracted draft", async () => {
    mockExtract.mockResolvedValue(draft);
    const res = await upload(png());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(draft);
    expect(mockExtract).toHaveBeenCalledWith(expect.any(String), "image/png");
  });

  it("returns 400 when no file is sent", async () => {
    const res = await upload();
    expect(res.status).toBe(400);
    expect(mockExtract).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-image file", async () => {
    const res = await upload(
      new File(["hello"], "notes.txt", { type: "text/plain" }),
    );
    expect(res.status).toBe(400);
    expect(mockExtract).not.toHaveBeenCalled();
  });

  it("returns 400 for an image over the size limit", async () => {
    const res = await upload(png(4 * 1024 * 1024));
    expect(res.status).toBe(400);
    expect(mockExtract).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-multipart body", async () => {
    const res = await app.request("/exercises/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: "nope" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 422 when the model refuses", async () => {
    mockExtract.mockRejectedValue(new ExtractionRefusedError());
    const res = await upload(png());
    expect(res.status).toBe(422);
  });

  it("returns 502 when extraction fails", async () => {
    mockExtract.mockRejectedValue(new ExtractionFailedError());
    const res = await upload(png());
    expect(res.status).toBe(502);
  });
});
