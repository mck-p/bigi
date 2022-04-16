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

  /**
   * Returns the Token that makes up
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
    let currentTokenStr = this.#source_file.charAt(this.#current_pos);

    // If the next character is the end of line, we
    // are going to just skip this and move on
    if (Tokens.EndOfLine.matches(currentTokenStr)) {
      return this.getNextToken();
    }

    // If it is whitespace, we can just return
    if (Tokens.WhiteSpace.matches(currentTokenStr)) {
      return {
        text: currentTokenStr,
        symbol: Symbols.WHITESPACE,
        start_index: this.#current_pos,
        end_index: this.#current_pos,
      };
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
        Tokens.Number.matches(nextCharacter) ||
        (nextCharacter === "." && !currentIdentifier.includes("."))
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
    }

    // If it is a character, it could be a reference
    // or variable declaration. We need to pull more
    // characters into our search to know for sure
    if (Tokens.Letter.matches(currentIdentifier)) {
      while (Tokens.ReferenceName.matches(currentIdentifier)) {
        const nextChar = this.getNextChar();

        if (Tokens.ReferenceName.matches(nextChar)) {
          currentIdentifier += nextChar;
          this.#current_pos++;
        } else {
          break;
        }
      }

      return {
        text: currentIdentifier,
        symbol: Symbols.REFERENCE,
        start_index,
        end_index: this.#current_pos,
      };
    }

    throw new Errors.Unrecognizable(
      currentTokenStr,
      this.source_path,
      this.#current_pos
    );
  }

  private getNextChar() {
    return this.#source_file.charAt(this.#current_pos + 1);
  }
}

export default Lexer;
