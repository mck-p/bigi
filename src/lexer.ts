import fs from "fs";

import * as Tokens from "./token";
import * as Errors from "./errors";
import { timeStamp } from "console";

interface Tree {
  [x: string]: any;
}

export const Symbols = {
  END_OF_FILE: Symbol("There are no more characters to process"),
  WHITESPACE: Symbol("There was whitespace here not part of a String"),
  COMMA: Symbol("There was a comma here that was not part of a String"),
  NUMBER: Symbol("There was a number here that was not part of a String"),
  REFERENCE: Symbol("There was a reference to some other value"),
  REFERENCE_WITH_FILTER_ATTACHED: Symbol(
    "There was a reference to some other value but with a filter"
  ),
  COMMENT: Symbol("There was a comment"),
  STRING: Symbol("There was a String"),
  RESERVED_SYMBOLS: {
    LET: Symbol("There was the LET reserved keyword"),
    SINGLE_QUOTE: Symbol("There was just a single quote here"),
    DATA: Symbol("There was the DATA reserved keyword"),
    OPEN_CURLY_BRACKET: Symbol('There was an opening of a curly bracket "{"'),
    CLOSE_CURLY_BRACKET: Symbol('There was an closing of a curly bracket "}"'),
    OPEN_CAROT_BRACKET: Symbol('There was an opening of a carot bracket "<"'),
    CLOSE_CAROT_BRACKET: Symbol('There was an closing of a carot bracket ">"'),
    COLON_SEPARATOR: Symbol('There was a colon separator ":"'),
  },
  OPERATORS: {
    ASSIGNMENT: Symbol("There was the ASSIGNMENT OPERATOR"),
    SUBTRACTION: Symbol("There was the SUBTRACTION OPERATOR"),
    ADDITION: Symbol("There was the ADDITION OPERATOR"),
    DIVISION: Symbol("There was the DIVISION OPERATOR"),
    MULTIPLICATION: Symbol("There was the MULTIPLICATION OPERATOR"),
    MODULUS: Symbol("There was the MODULUS OPERATOR"),
  },
};

export const RESERVED_SYMBOLS = {
  SINGLE_QUOTE: `'`,
  LET: "let",
  DATA: "data",
  OPEN_CURLY_BRACKET: "{",
  CLOSE_CURLY_BRACKET: "}",
  OPEN_CAROT_BRACKET: "<",
  CLOSE_CAROT_BRACKET: ">",
  COLON_SEPARATOR: ":",
};

export const OPERATORS = {
  ASSIGNMENT: "=",
  ADDITION: "+",
  SUBTRACTION: "-",
  DIVISION: "/",
  MULTIPLICATION: "*",
  MODULUS: "%",
};

interface Token {
  /**
   * The underlying text that this
   * token represents. 0+ length
   */
  text: string;
  /**
   * The Specific Symbol that this
   * Token represents.
   */
  symbol: symbol;
  /**
   * Where in the source file does this
   * token start?
   */
  start_index: number;
  /**
   * Where in the source file does this
   * token end?
   */
  end_index: number;
}

/**
 * A Lexer takes in some Source
 * and returns some Tree of Tokens
 */
export class Lexer {
  source_path: string;
  #source_file: string;
  #current_pos = -1;
  #end_index: number;
  #finished = false;

  constructor(source: string) {
    this.validateFileMeta(source);

    this.source_path = source;

    this.#source_file = fs.readFileSync(this.source_path, "utf-8");
    this.#end_index = this.#source_file.length - 1;
  }

  private validateFileMeta(source: string) {
    if (!fs.existsSync(source)) {
      throw new Errors.BadSource(`The path ${source} does not exist`);
    }
  }

  private canSkipCharacter(value: string) {
    return Tokens.EndOfLine.matches(value) || Tokens.WhiteSpace.matches(value);
  }

  /**
   * Returns the Token that makes up the next
   * unit that it is able to parse.
   *
   * This is meant to be called over and over
   * again by the Parser
   */
  getNextToken(): Token {
    if (this.#finished) {
      throw new Errors.LexerAlreadyFinished();
    }

    // Move cursor to next character
    this.#current_pos++;

    // If we have reached the end of the file
    if (this.#current_pos >= this.#source_file.length) {
      // Keep future us from trying to get the next token
      // since it is already finished
      this.#finished = true;

      // we return the End of File token
      return {
        text: "",
        start_index: this.#current_pos,
        end_index: this.#current_pos,
        symbol: Symbols.END_OF_FILE,
      };
    }

    // Get the next character
    let currentTokenStr = this.getCurrentChar();

    if (this.canSkipCharacter(currentTokenStr)) {
      return this.getNextToken();
    }

    // If it is a comma, we can just return
    if (Tokens.Comma.matches(currentTokenStr)) {
      return {
        text: currentTokenStr,
        symbol: Symbols.COMMA,
        start_index: this.#current_pos,
        end_index: this.#current_pos,
      };
    }

    // We may have a more complex token so let's
    // start building the text value
    let currentIdentifier = currentTokenStr;
    const start_index = this.#current_pos;

    // If the next character is a number, it is the
    // start of a number value so we can start parsing
    if (Tokens.Number.matches(currentIdentifier)) {
      let nextCharacter = this.getNextChar();

      while (
        (Tokens.Number.matches(nextCharacter) ||
          (nextCharacter === "." && !currentIdentifier.includes("."))) &&
        !this.atEnd()
      ) {
        currentIdentifier += nextCharacter;
        this.#current_pos++;
        nextCharacter = this.getNextChar();
      }

      return {
        text: currentIdentifier,
        symbol: Symbols.NUMBER,
        start_index,
        end_index: this.#current_pos,
      };
    }

    // If the current identifier isn't a letter
    // or a number, it might be an operator OR
    // it might be a negative number. SO
    // let's go ahead and check for that
    if (currentIdentifier === "-") {
      const nextChar = this.getNextChar();

      // If the next token is a number
      if (Tokens.Number.matches(nextChar)) {
        // we can get that token
        const token = this.getNextToken();

        // and we can just modify it before returning
        return {
          text: `-${token.text}`,
          start_index,
          end_index: token.end_index,
          symbol: Symbols.NUMBER,
        };
      }
      // Else if the next character is also an '-'
      // that means that we have a comment until we
      // reach an end of line character
      else if (nextChar === "-") {
        let nextCharacter = nextChar;

        while (!Tokens.EndOfLine.matches(nextCharacter) && !this.atEnd()) {
          currentIdentifier += nextCharacter;
          this.#current_pos++;
          nextCharacter = this.getNextChar();
        }

        return {
          text: currentIdentifier,
          symbol: Symbols.COMMENT,
          start_index,
          end_index: this.#current_pos,
        };
      } else {
        return {
          text: currentIdentifier,
          symbol: Symbols.OPERATORS.SUBTRACTION,
          start_index,
          end_index: this.#current_pos,
        };
      }
    } else if (currentIdentifier === RESERVED_SYMBOLS.SINGLE_QUOTE) {
      let nextChar;
      let isEscaped = false;

      do {
        nextChar = this.getNextChar();

        if (nextChar === "\\") {
          isEscaped = true;
          this.#current_pos++;

          continue;
        }

        if (nextChar === RESERVED_SYMBOLS.SINGLE_QUOTE) {
          if (isEscaped) {
            currentIdentifier += nextChar;
            this.#current_pos++;
            continue;
          }
        }

        if (
          (Tokens.EndOfLine.matches(nextChar) && !isEscaped) ||
          this.atEnd()
        ) {
          throw new Errors.StringNotClosed(start_index);
        }

        currentIdentifier += nextChar;

        this.#current_pos++;
        isEscaped = false;
      } while (nextChar !== RESERVED_SYMBOLS.SINGLE_QUOTE || isEscaped);

      return {
        text: currentIdentifier,
        symbol: Symbols.STRING,
        start_index,
        end_index: this.#current_pos,
      };
    }

    // If it is a character, it could be a reference
    // or variable declaration. We need to pull more
    // characters into our search to know for sure
    if (Tokens.Letter.matches(currentIdentifier)) {
      while (Tokens.ReferenceName.matches(currentIdentifier) && !this.atEnd()) {
        const nextChar = this.getNextChar();

        if (Tokens.ReferenceName.matches(nextChar)) {
          currentIdentifier += nextChar;
          this.#current_pos++;
        } else {
          break;
        }
      }

      // iterate over all reserved symbols and see if it is one
      for (let [key, value] of Object.entries(RESERVED_SYMBOLS)) {
        if (currentIdentifier === value) {
          const typedKey = key as any as keyof typeof RESERVED_SYMBOLS;

          return {
            text: currentIdentifier,
            symbol: Symbols.RESERVED_SYMBOLS[typedKey],
            start_index,
            end_index: this.#current_pos,
          };
        }
      }

      // Maybe we are a filtered Data Key!
      const next2Chars = this.peakNextChars(2);

      if (
        next2Chars.length === 2 &&
        next2Chars[1] === ":" &&
        next2Chars[0] === next2Chars[1]
      ) {
        // we have a filter! we need to keep parsing.
        currentIdentifier += "::";
        this.#current_pos += 2;

        const nextToken = this.getNextToken();

        return {
          text: `${currentIdentifier}${nextToken.text}`,
          start_index,
          end_index: nextToken.end_index,
          symbol: Symbols.REFERENCE_WITH_FILTER_ATTACHED,
        };
      }

      return {
        text: currentIdentifier,
        symbol: Symbols.REFERENCE,
        start_index,
        end_index: this.#current_pos,
      };
    }

    // iterate over all the operators and see if it is one
    for (let [key, value] of Object.entries(OPERATORS)) {
      // check the next char first so that we don't exit early
      // if we see `+` instead of `++`
      if (`${currentIdentifier}${this.getNextChar()}` === value) {
        const typedKey = key as any as keyof typeof OPERATORS;

        this.#current_pos++;

        return {
          text: `${currentIdentifier}${this.getCurrentChar()}`,
          symbol: Symbols.OPERATORS[typedKey],
          start_index,
          end_index: this.#current_pos,
        };
      }
    }

    // maybe it is an operator?
    for (let [key, value] of Object.entries(OPERATORS)) {
      // check the next char first so that we don't exit early
      // if we see `+` instead of `++`
      if (currentIdentifier === value) {
        const typedKey = key as any as keyof typeof OPERATORS;

        this.#current_pos++;

        return {
          text: currentIdentifier,
          symbol: Symbols.OPERATORS[typedKey],
          start_index,
          end_index: this.#current_pos,
        };
      }
    }

    // maybe it's a reserved glyph?
    for (let [key, value] of Object.entries(RESERVED_SYMBOLS)) {
      if (currentIdentifier === value) {
        const typedKey = key as any as keyof typeof RESERVED_SYMBOLS;

        return {
          text: currentIdentifier,
          symbol: Symbols.RESERVED_SYMBOLS[typedKey],
          start_index,
          end_index: this.#current_pos,
        };
      }
    }

    throw new Errors.Unrecognizable(
      currentTokenStr,
      this.source_path,
      this.#current_pos
    );
  }

  private getNextChar() {
    return this.peakNextChars(1)[0];
  }

  private peakNextChars(n: number) {
    return Array.from({ length: n }, (_, i) =>
      this.#source_file.charAt(this.#current_pos + 1 + i)
    );
  }

  private getCurrentChar() {
    return this.#source_file.charAt(this.#current_pos);
  }

  private atEnd() {
    return this.#current_pos === this.#end_index;
  }
}

export default Lexer;
