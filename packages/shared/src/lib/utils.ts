export function getObjectTag(
  obj: { exercise_number?: number } | { worksheet_number?: number },
): string {
  if ("exercise_number" in obj && obj.exercise_number !== undefined) {
    return `EX-${obj.exercise_number.toString().padStart(5, "0")}`;
  }
  if ("worksheet_number" in obj && obj.worksheet_number !== undefined) {
    return `WS-${obj.worksheet_number.toString().padStart(5, "0")}`;
  }
  return "Unknown Object";
}
