export class QuestionNotFoundError extends Error {
  constructor(message = "One or more question IDs do not exist") {
    super(message);
    this.name = "QuestionNotFoundError";
  }
}

export class ExerciseNotFoundError extends Error {
  constructor(message = "Exercise ID does not exist") {
    super(message);
    this.name = "ExerciseNotFoundError";
  }
}

export class WorksheetNotFoundError extends Error {
  constructor(message = "Worksheet ID does not exist") {
    super(message);
    this.name = "WorksheetNotFoundError";
  }
}
