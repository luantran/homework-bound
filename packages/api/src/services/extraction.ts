import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  CreateExerciseSchema,
  type CreateExercise,
} from "@homework-bound/shared";
import { ExtractionFailedError, ExtractionRefusedError } from "../errors";

const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `You extract French language exercises from scanned textbook pages for a teacher's exercise bank.

- Keep all exercise text in the original French, exactly as printed. Do not translate or correct it.
- Extract only multiple-choice questions (type "mcq"). Key the options A to E in the order they appear on the page.
- Set "answer" to the letter of the correct option only if the page shows an answer key or marks the correct choice. Otherwise set it to an empty string. Never guess.
- Put the instructions that apply to the whole exercise in "prompt", and any reading passage or example text in "context".
- Choose "category" from grammar, conjugaison, or reading based on what the exercise practices.
- Leave out fields the page does not show, such as levels and tags.`;

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
            { type: "text", text: "Extract the exercise on this page." },
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
  return response.parsed_output;
}
