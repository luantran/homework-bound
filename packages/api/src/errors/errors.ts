export class QuestionNotFoundError extends Error {
  constructor(message = "One or more question IDs do not exist") {
    super(message);
    this.name = "QuestionNotFoundError";
  }
}
