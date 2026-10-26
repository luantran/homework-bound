import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  CreateExerciseSchema,
  type CreateExercise,
} from "@homework-bound/shared";
import { ExtractionFailedError, ExtractionRefusedError } from "../errors";

const MODEL = "claude-sonnet-5-5";

const SYSTEM_PROMPT = `You extract French language exercises from scanned textbook pages for a teacher's exercise bank.

- Transcribe every word exactly as printed, letter by letter, in the original French. Do not translate, correct, or guess at spellings; these are often deliberately wrong conjugations, so a misspelled option may be intentional.
- The exercise-level "prompt" is the instruction printed once for the whole exercise (e.g. "Encercle la bonne réponse."). Always include it when the page prints one; it belongs only at the exercise level, not in the questions.
- Each question's "prompt" is that item's own label as printed next to it, without its letter or number (e.g. "finir, 1re pers. plur."). Never leave it empty or reuse the exercise instruction.
- Put any reading passage or example text in the exercise-level "context".
- Extract only multiple-choice questions (type "mcq"). Key the options A to E in the exact left-to-right order they are printed for that item.
- Set "answer" to the letter of the correct option only if the page shows an answer key or marks the correct choice. Otherwise set it to an empty string. Never work out the answer yourself.
- Choose "category" from grammar, conjugaison, or reading based on what the exercise practices.
- Omit "hint" unless one is printed on the page.`;

export type ImageMediaType = "image/jpeg" | "image/png";

// Created on first use so importing this module doesn't require ANTHROPIC_API_KEY (e.g. in tests)
let client: Anthropic | undefined;
const getClient = () => (client ??= new Anthropic());

export async function extractExercise(
  imageBase64: string,
  mediaType: ImageMediaType,
): Promise<CreateExercise> {
  let response;
  try {
    response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extract the exercise on this page, including the instruction printed at the top.",
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(CreateExerciseSchema) },
    });
  } catch (e) {
    // API errors (auth, rate limit, outage) pass through so the route can map them;
    // anything else here is the response failing schema validation
    if (e instanceof Anthropic.APIError) throw e;
    throw new ExtractionFailedError();
  }

  if (response.stop_reason === "refusal") throw new ExtractionRefusedError();
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new ExtractionFailedError();
  }
  // Levels and tags are the teacher's call and never printed on a page, so drop whatever the model filled in
  const { category, prompt, context, questions } = response.parsed_output;
  return { category, prompt, context, questions };
}
