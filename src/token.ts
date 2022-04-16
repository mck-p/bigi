export class Token {}

export class WhiteSpace {
  static regexp = /\s/;

  static matches(value: string) {
    return WhiteSpace.regexp.exec(value);
  }
}

export class EndOfLine {
  static regexp = /\n|\r\n|\r/;

  static matches(value: string) {
    return EndOfLine.regexp.exec(value);
  }
}

export class Comma {
  static regexp = /\,/;

  static matches(value: string) {
    return Comma.regexp.exec(value);
  }
}

export class Number {
  static regexp = /[0-9]/;

  static matches(value: string) {
    return Number.regexp.exec(value);
  }
}

export class Letter {
  static regexp = /[a-zA-Z]/;

  static matches(value: string) {
    return Letter.regexp.exec(value);
  }
}

export class ReferenceName {
  static regexp = /[a-zA-Z0-9]/;

  static matches(value: string) {
    return ReferenceName.regexp.exec(value);
  }
}

export const ReservedKeywords = new Set(["let"]);
