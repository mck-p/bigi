export class BadSource extends Error {
  code = 1000;
  constructor(reason: string) {
    super();

    this.message = `Could not process input due to "${reason}". The source itself is bad and re-running will not help. See error log for more details on how to fix the issue before re-trying.`;
  }
}

export class Unrecognizable extends BadSource {
  code = 1001;

  constructor(token: string, file_source: string, token_index: number) {
    super(`Unrecognizable Input ${token} at ${token_index} of ${file_source}`);
  }
}

export class LexerAlreadyFinished extends Error {
  code = 1002;

  constructor() {
    super();

    this.message = `You tried to call the Lexer after it has finished processing the file. This will not work. You should change your implementation and look for the End of File Token or handle this error as your End of File path. Restarting without fixing your code will not change the outcome.`;
  }
}
