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

export class ExtractionRefusedError extends Error {
  constructor(message = "The model declined to extract this image") {
    super(message);
    this.name = "ExtractionRefusedError";
  }
}

export class ExtractionFailedError extends Error {
  constructor(message = "Could not extract an exercise from this image") {
    super(message);
    this.name = "ExtractionFailedError";
  }
}
