import { test, expect } from "@playwright/test";

const mockQuestion = {
  id: "00000000-0000-0000-0000-000000000002",
  created_by: "00000000-0000-0000-0000-000000000001",
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
  exercise_id: "00000000-0000-0000-0000-000000000001",
  prompt: "Quel est le participe passé de 'avoir'?",
  answer: "eu",
  type: "fill_in_gap",
};

const mockExercise = {
  id: "00000000-0000-0000-0000-000000000001",
  created_by: "00000000-0000-0000-0000-000000000001",
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
  exercise_number: 1,
  category: "grammar",
  context: "A text containing a sentence with a missing word",
  prompt: "Fill in the blank with the correct word.",
  questions: [mockQuestion],
  tags: ["grammar.conjugaison"],
  worksheets_exercises: [],
};

const newFillInGapQuestion = {
  prompt: "Quel est le participe passé de 'avoir'?",
  answer: "eu",
  type: "fill_in_gap",
};

const newMcqQuestion = {
  prompt: "Quel verbe est du premier groupe?",
  options: { A: "parler", B: "finir" },
  answer: "A",
  type: "mcq",
};

const newExercise = {
  ...mockExercise,
  id: "00000000-0000-0000-0000-000000000003",
  exercise_number: 2,
  category: "vocabulary",
  prompt: "New exercise prompt",
  context: "New exercise context",
  questions: [],
};

const updatedExercise = {
  ...mockExercise,
  prompt: "Updated prompt",
};

const mockWorksheet = {
  id: "00000000-0000-0000-0000-000000000010",
  worksheet_number: 1,
};

const mockExerciseWithWorksheet = {
  ...mockExercise,
  worksheets_exercises: [{ worksheet: mockWorksheet }],
};

const mockExercises = [mockExercise];

test.describe("Exercises page", () => {
  test.describe("empty state", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("http://localhost:3000/exercises", (route) =>
        route.fulfill({ json: [] }),
      );
      await page.goto("/exercises");
    });

    test("renders table headers", async ({ page }) => {
      await expect(
        page.getByRole("columnheader", { name: "#", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Category" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Tags" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Prompt" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Context" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Level" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "# Questions" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Appears in" }),
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: "Actions" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "New Exercise" }),
      ).toBeVisible();
    });

    test("shows empty state message when no exercises", async ({ page }) => {
      await expect(page.getByText("No exercises yet")).toBeVisible();
    });
  });

  test.describe("with exercises", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("http://localhost:3000/exercises", (route) =>
        route.fulfill({ json: mockExercises }),
      );
      await page.goto("/exercises");
    });

    test("lists exercises", async ({ page }) => {
      await expect(page.getByRole("row")).toHaveCount(2);

      const row = page
        .getByRole("row")
        .filter({ hasText: mockExercise.category });

      await expect(row.getByTestId("cell-number")).toHaveText(
        String(mockExercise.exercise_number),
      );
      await expect(row.getByTestId("cell-category")).toHaveText(
        mockExercise.category,
      );
      await expect(row.getByTestId("cell-prompt")).toHaveText(
        mockExercise.prompt,
      );
      await expect(row.getByTestId("cell-context")).toHaveText(
        mockExercise.context,
      );
      await expect(row.getByTestId("cell-tags")).toHaveText(
        mockExercise.tags[0].split(".").at(-1)!,
      );
      await expect(row.getByTestId("cell-level")).toHaveText("—");
      await expect(row.getByTestId("cell-questions")).toHaveText(
        String(mockExercise.questions.length),
      );
      await expect(row.getByTestId("cell-worksheets")).toHaveText(
        `${mockExercise.worksheets_exercises.length} worksheets`,
      );
      await expect(
        row.getByTestId("cell-actions").getByRole("button", { name: "Edit" }),
      ).toBeVisible();
      await expect(
        row.getByTestId("cell-actions").getByRole("button", { name: "Delete" }),
      ).toBeVisible();
    });
  });
  test.describe("add exercise", () => {
    test.beforeEach(async ({ page }) => {
      let getCount = 0;
      await page.route("http://localhost:3000/exercises", (route) => {
        if (route.request().method() === "POST") {
          return route.fulfill({ json: newExercise, status: 201 });
        }
        getCount++;
        route.fulfill({
          json:
            getCount === 1 ? mockExercises : [...mockExercises, newExercise],
        });
      });

      await page.goto("/exercises");
    });

    test("exercise modal renders correctly", async ({ page }) => {
      await page.getByRole("button", { name: "New Exercise" }).click();

      const dialog = page.getByRole("dialog", { name: "New Exercise" });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "New Exercise" }),
      ).toBeVisible();

      // left panel — Details open by default
      await expect(
        dialog.getByRole("button", { name: "Details" }),
      ).toBeVisible();
      await expect(dialog.getByTestId("select-category")).toBeVisible();

      // Prompt open by default
      await expect(
        dialog.getByRole("button", { name: "Prompt" }),
      ).toBeVisible();
      await expect(dialog.getByTestId("textarea-prompt")).toBeVisible();

      // Context collapsed by default
      await expect(
        dialog.getByRole("button", { name: "Context" }),
      ).toBeVisible();
      await expect(dialog.getByTestId("textarea-context")).not.toBeVisible();

      // right panel
      await expect(
        dialog.getByRole("button", { name: "Add Question" }),
      ).toBeVisible();

      // footer
      await expect(
        dialog.getByRole("button", { name: "Cancel" }),
      ).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("question dialog renders correctly", async ({ page }) => {
      await page.getByRole("button", { name: "New Exercise" }).click();
      const dialog = page.getByRole("dialog", { name: "New Exercise" });
      await dialog.getByRole("button", { name: "Add Question" }).click();

      const questionDialog = page
        .getByRole("dialog")
        .filter({ hasText: "New Question" });

      await expect(
        questionDialog.getByRole("heading", { name: "New Question" }),
      ).toBeVisible();
      await expect(
        questionDialog.getByTestId("select-question-type"),
      ).toBeVisible();
      await expect(
        questionDialog.getByTestId("input-question-prompt"),
      ).toBeVisible();
      await expect(
        questionDialog.getByTestId("input-question-answer"),
      ).toBeVisible();
      await expect(
        questionDialog.getByRole("button", { name: "Cancel" }),
      ).toBeVisible();
      // Confirm disabled until form is filled
      await expect(
        questionDialog.getByRole("button", { name: "Confirm" }),
      ).toBeDisabled();
      // MCQ options not visible until type is mcq
      await expect(questionDialog.getByText("Options")).not.toBeVisible();
    });

    test("fills and saves a new exercise", async ({ page }) => {
      await page.getByRole("button", { name: "New Exercise" }).click();
      const dialog = page.getByRole("dialog", { name: "New Exercise" });

      // select category
      await page.getByTestId("native-select-category").selectOption("grammar");

      await dialog.getByTestId("textarea-prompt").fill("New exercise prompt");

      // Context is collapsed — open it first
      await dialog.getByRole("button", { name: "Context" }).click();
      await dialog.getByTestId("textarea-context").fill("New exercise context");

      await dialog.getByRole("button", { name: "Add Question" }).click();

      const questionDialog = page
        .getByRole("dialog")
        .filter({ hasText: "New Question" });

      await page
        .getByTestId("native-select-question-type")
        .selectOption(newFillInGapQuestion.type);
      await questionDialog
        .getByTestId("input-question-prompt")
        .fill(newFillInGapQuestion.prompt);
      await questionDialog
        .getByTestId("input-question-answer")
        .fill(newFillInGapQuestion.answer);
      await questionDialog.getByRole("button", { name: "Confirm" }).click();

      await dialog.getByRole("button", { name: "Add Question" }).click();

      const mcqDialog = page
        .getByRole("dialog")
        .filter({ hasText: "New Question" });

      await page
        .getByTestId("native-select-question-type")
        .selectOption(newMcqQuestion.type);
      await mcqDialog
        .getByTestId("input-question-prompt")
        .fill(newMcqQuestion.prompt);
      await mcqDialog
        .getByTestId("input-option-A")
        .fill(newMcqQuestion.options.A);
      await mcqDialog
        .getByTestId("input-option-B")
        .fill(newMcqQuestion.options.B);
      // radio inputs are visually hidden — force the click
      await mcqDialog.getByRole("radio").first().click({ force: true });
      await mcqDialog.getByRole("button", { name: "Confirm" }).click();

      await dialog.getByRole("button", { name: "Save" }).click();

      // modal closes
      await expect(dialog).not.toBeVisible();

      // table now has 3 rows (header + 2 data rows)
      await expect(page.getByRole("row")).toHaveCount(3);

      // new row is present with correct content
      const newRow = page
        .getByRole("row")
        .filter({ hasText: newExercise.category });
      await expect(newRow.getByTestId("cell-number")).toHaveText(
        String(newExercise.exercise_number),
      );
      await expect(newRow.getByTestId("cell-category")).toHaveText(
        newExercise.category,
      );
      await expect(newRow.getByTestId("cell-prompt")).toHaveText(
        newExercise.prompt,
      );
      await expect(newRow.getByTestId("cell-context")).toHaveText(
        newExercise.context,
      );
      await expect(newRow.getByTestId("cell-tags")).toHaveText(
        newExercise.tags[0].split(".").at(-1)!,
      );
      await expect(newRow.getByTestId("cell-level")).toHaveText("—");
      await expect(newRow.getByTestId("cell-questions")).toHaveText(
        String(newExercise.questions.length),
      );
      await expect(newRow.getByTestId("cell-worksheets")).toHaveText(
        `${newExercise.worksheets_exercises.length} worksheets`,
      );
    });
  });

  test.describe("edit exercise", () => {
    test.beforeEach(async ({ page }) => {
      let getCount = 0;
      await page.route("http://localhost:3000/exercises", (route) => {
        getCount++;
        route.fulfill({
          json: getCount === 1 ? mockExercises : [updatedExercise],
        });
      });
      await page.route(
        `http://localhost:3000/exercises/${mockExercise.id}`,
        (route) => route.fulfill({ json: updatedExercise }),
      );
      await page.goto("/exercises");
    });

    test("pre-fills form with existing exercise data", async ({ page }) => {
      await page
        .getByRole("row")
        .filter({ hasText: mockExercise.category })
        .getByTestId("cell-actions")
        .getByRole("button", { name: "Edit" })
        .click();

      const dialog = page.getByRole("dialog", { name: "Edit Exercise" });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "Edit Exercise" }),
      ).toBeVisible();

      // left panel — category, tags, prompt, context
      await expect(dialog.getByTestId("select-category")).toContainText(
        mockExercise.category,
      );
      await expect(dialog.getByTestId("textarea-prompt")).toHaveValue(
        mockExercise.prompt,
      );
      await expect(
        dialog
          .getByTestId("tags-display")
          .getByText(mockExercise.tags[0].split(".").at(-1)!),
      ).toBeVisible();
      await dialog.getByRole("button", { name: "Context" }).click();
      await expect(dialog.getByTestId("textarea-context")).toHaveValue(
        mockExercise.context,
      );

      // right panel — existing question is listed
      await expect(dialog.getByText(mockQuestion.prompt)).toBeVisible();
      await expect(
        dialog.getByText(`Answer: ${mockQuestion.answer}`),
      ).toBeVisible();
      await expect(dialog.getByText(mockQuestion.type)).toBeVisible();
    });

    test("saves edits and updates the row", async ({ page }) => {
      await page
        .getByRole("row")
        .filter({ hasText: mockExercise.category })
        .getByTestId("cell-actions")
        .getByRole("button", { name: "Edit" })
        .click();

      const dialog = page.getByRole("dialog", { name: "Edit Exercise" });
      await dialog.getByTestId("textarea-prompt").fill(updatedExercise.prompt);
      await dialog.getByRole("button", { name: "Save" }).click();

      await expect(dialog).not.toBeVisible();

      const row = page
        .getByRole("row")
        .filter({ hasText: mockExercise.category });
      await expect(row.getByTestId("cell-number")).toHaveText(
        String(updatedExercise.exercise_number),
      );
      await expect(row.getByTestId("cell-category")).toHaveText(
        updatedExercise.category,
      );
      await expect(row.getByTestId("cell-prompt")).toHaveText(
        updatedExercise.prompt,
      );
      await expect(row.getByTestId("cell-context")).toHaveText(
        updatedExercise.context,
      );
      await expect(row.getByTestId("cell-tags")).toHaveText(
        updatedExercise.tags[0].split(".").at(-1)!,
      );
      await expect(row.getByTestId("cell-level")).toHaveText("—");
      await expect(row.getByTestId("cell-questions")).toHaveText(
        String(updatedExercise.questions.length),
      );
      await expect(row.getByTestId("cell-worksheets")).toHaveText(
        `${updatedExercise.worksheets_exercises.length} worksheets`,
      );
    });
  });

  test.describe("delete exercise", () => {
    test.beforeEach(async ({ page }) => {
      let getCount = 0;
      await page.route("http://localhost:3000/exercises", (route) => {
        getCount++;
        route.fulfill({ json: getCount === 1 ? mockExercises : [] });
      });
      await page.route(
        `http://localhost:3000/exercises/${mockExercise.id}`,
        (route) => route.fulfill({ status: 204, body: "" }),
      );
      await page.goto("/exercises");
    });

    test("shows delete dialog with no worksheets message", async ({ page }) => {
      await page
        .getByRole("row")
        .filter({ hasText: mockExercise.category })
        .getByTestId("cell-actions")
        .getByRole("button", { name: "Delete" })
        .click();

      const deleteDialog = page.getByRole("dialog", {
        name: "Delete Exercise",
      });
      await expect(deleteDialog).toBeVisible();
      await expect(
        deleteDialog.getByRole("heading", { name: "Delete Exercise" }),
      ).toBeVisible();
      await expect(deleteDialog.getByText("no worksheets")).toBeVisible();
      await expect(
        deleteDialog.getByText("Delete all its questions"),
      ).toBeVisible();
      await expect(
        deleteDialog.getByText("This cannot be undone."),
      ).toBeVisible();
      await expect(
        deleteDialog.getByRole("button", { name: "Cancel" }),
      ).toBeVisible();
      await expect(
        deleteDialog.getByRole("button", { name: "Delete" }),
      ).toBeVisible();
    });

    test("deletes exercise and removes row", async ({ page }) => {
      await page
        .getByRole("row")
        .filter({ hasText: mockExercise.category })
        .getByTestId("cell-actions")
        .getByRole("button", { name: "Delete" })
        .click();

      await page
        .getByRole("dialog", { name: "Delete Exercise" })
        .getByRole("button", { name: "Delete" })
        .click();

      await expect(page.getByRole("row")).toHaveCount(1);
      await expect(
        page.getByRole("row").filter({ hasText: mockExercise.category }),
      ).not.toBeVisible();
    });
  });

  test.describe("delete exercise with linked worksheets", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("http://localhost:3000/exercises", (route) => {
        if (route.request().method() === "GET") {
          route.fulfill({ json: [mockExerciseWithWorksheet] });
        }
      });
      await page.route(
        `http://localhost:3000/exercises/${mockExercise.id}`,
        (route) => route.fulfill({ status: 204, body: "" }),
      );
      await page.goto("/exercises");
    });

    test("shows linked worksheet name in delete dialog", async ({ page }) => {
      await page
        .getByRole("row")
        .filter({ hasText: mockExercise.category })
        .getByTestId("cell-actions")
        .getByRole("button", { name: "Delete" })
        .click();

      const deleteDialog = page.getByRole("dialog", {
        name: "Delete Exercise",
      });
      await expect(deleteDialog).toBeVisible();
      await expect(
        deleteDialog.getByRole("heading", { name: "Delete Exercise" }),
      ).toBeVisible();
      await expect(deleteDialog.getByText("WS-00001")).toBeVisible();
      await expect(
        deleteDialog.getByText("Delete all its questions"),
      ).toBeVisible();
      await expect(
        deleteDialog.getByText("This cannot be undone."),
      ).toBeVisible();
    });
  });
});
