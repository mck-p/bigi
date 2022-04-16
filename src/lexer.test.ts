import path from "path";
import test from "ava";
import { Lexer, Symbols } from "./lexer";
import * as Errors from "./errors";

const paths = {
  emptyBigi: path.resolve(__dirname, "..", "artifacts", "test.empty.bigi"),
  unrecognized: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.unrecognized.bigi"
  ),
  comma: path.resolve(__dirname, "..", "artifacts", "test.comma.bigi"),
  multiple_tokens: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.multiple_tokens.bigi"
  ),
  multi_line: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.multi_line.bigi"
  ),
  numbers: path.resolve(__dirname, "..", "artifacts", "test.numbers.bigi"),
  reference: path.resolve(__dirname, "..", "artifacts", "test.reference.bigi"),
  negative_number: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.negative_number.bigi"
  ),
  decimal_number: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.decimal_number.bigi"
  ),
  comment: path.resolve(__dirname, "..", "artifacts", "test.comment.bigi"),
  number_followed_by_comment: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.number_followed_by_comment.bigi"
  ),
  empty_comment: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.empty_comment.bigi"
  ),

  nonExistant: "/not-real.bigi",
};

test("Lexer Throws Error on Non-Existent File", (assert) => {
  // Tell the test framework that we expect
  // one test to happen. That way, if we don't
  // throw and the catch is never triggered,
  // we fail this test due to this assertion
  assert.plan(1);

  try {
    // We expect that when given a file path
    // that doesn't exist this will throw
    new Lexer(paths.nonExistant);
  } catch (e) {
    assert.truthy(
      e instanceof Errors.BadSource,
      "The Lexer throws a bad source error"
    );
  }
});

test("Throws an error when given a file that has a character that the language does not recognize", (assert) => {
  // Tell the test framework that we expect
  // one test to happen. That way, if we don't
  // throw and the catch is never triggered,
  // we fail this test due to this assertion
  assert.plan(1);

  try {
    const lexer = new Lexer(paths.unrecognized);

    // We expect that when we get the next token
    // of a file that only contains one token and
    // that that token is one that the language does
    // not recognize
    lexer.getNextToken();
  } catch (e) {
    // that it will throw an Unrecognizable error
    assert.truthy(
      e instanceof Errors.Unrecognizable,
      "The Lexer throws an Unrecognizable error"
    );
  }
});

test("lexer.getNextToken returns End Of File Token if the character is the end of the file", (assert) => {
  const lexer = new Lexer(paths.emptyBigi);

  const token = lexer.getNextToken();

  assert.is(token.symbol, Symbols.END_OF_FILE);
});

test("lexer.getNextToken throws an error if you try to read it after it reached end of file", (assert) => {
  assert.plan(2);
  const lexer = new Lexer(paths.emptyBigi);

  const token = lexer.getNextToken();

  // We reached the end of file
  assert.is(token.symbol, Symbols.END_OF_FILE);

  try {
    lexer.getNextToken();
  } catch (e) {
    assert.truthy(
      e instanceof Errors.LexerAlreadyFinished,
      "Lexer throws the error when it is finished and you try to re-read"
    );
  }
});

test("lexer.getNextToken returns a Comma Token if the next character is a comma", (assert) => {
  const lexer = new Lexer(paths.comma);

  const token = lexer.getNextToken();

  assert.is(token.symbol, Symbols.COMMA);
});

test("Calling lexer.getNextToken multiple times returns the correct Tokens in the correct order", (assert) => {
  const lexer = new Lexer(paths.multiple_tokens);

  assert.plan(4);
  // the file is , ,
  // comma whitespace comma
  // let's make sure that we see
  // that
  //
  // Our first token should be a comma
  let token = lexer.getNextToken();
  assert.is(token.symbol, Symbols.COMMA);

  // The second one should be a comma
  token = lexer.getNextToken();
  assert.is(token.symbol, Symbols.COMMA);

  // The final one should be End of File
  token = lexer.getNextToken();
  assert.is(token.symbol, Symbols.END_OF_FILE);

  try {
    lexer.getNextToken();
  } catch (e) {
    assert.truthy(
      e instanceof Errors.LexerAlreadyFinished,
      "Lexer already finished"
    );
  }
});

test("lexer.getNextToken works with multiple statement lines", (assert) => {
  const lexer = new Lexer(paths.multi_line);

  const token1 = lexer.getNextToken();
  assert.is(token1.symbol, Symbols.COMMA);

  const token2 = lexer.getNextToken();
  assert.is(token2.symbol, Symbols.COMMA);

  const token3 = lexer.getNextToken();
  assert.is(token3.symbol, Symbols.END_OF_FILE);
});

test("lexer.getNextToken returns positive integers as numbers", (assert) => {
  const lexer = new Lexer(paths.numbers);
  const token1 = lexer.getNextToken();
  assert.deepEqual(token1, {
    text: "1",
    symbol: Symbols.NUMBER,
    start_index: 0,
    end_index: 0,
  });

  const token2 = lexer.getNextToken();
  assert.deepEqual(token2, {
    text: "12345",
    symbol: Symbols.NUMBER,
    start_index: 2,
    end_index: 6,
  });
});

test("lexer.getNextToken returns a Reference Token for a grouping of symbols that should be treated as a a variable reference", (assert) => {
  const lexer = new Lexer(paths.reference);
  const token = lexer.getNextToken();

  assert.deepEqual(token, {
    text: "foo",
    start_index: 0,
    end_index: 2,
    symbol: Symbols.REFERENCE,
  });
});

test("lexer.getNextToken returns a Number Token for a negative number", (assert) => {
  const lexer = new Lexer(paths.negative_number);
  const token = lexer.getNextToken();

  assert.deepEqual(token, {
    text: "-12345",
    symbol: Symbols.NUMBER,
    start_index: 0,
    end_index: 5,
  });
});

test("lexer.getNextToken returns a Number Token for a decimal number", (assert) => {
  const lexer = new Lexer(paths.decimal_number);
  const positiveToken = lexer.getNextToken();

  assert.deepEqual(positiveToken, {
    text: "123.45",
    symbol: Symbols.NUMBER,
    start_index: 0,
    end_index: 5,
  });

  const negativeToken = lexer.getNextToken();

  assert.deepEqual(negativeToken, {
    text: "-123.45",
    symbol: Symbols.NUMBER,
    start_index: 7,
    end_index: 13,
  });
});

test("lexer.getNextToken returns a Comment Token for an empty comment", (assert) => {
  const lexer = new Lexer(paths.empty_comment);
  const commentToken = lexer.getNextToken();

  assert.deepEqual(commentToken, {
    text: "--",
    symbol: Symbols.COMMENT,
    start_index: 0,
    end_index: 1,
  });
});

test("lexer.getNextToken returns a Comment Token for a line that only contains a comment", (assert) => {
  const lexer = new Lexer(paths.comment);
  const commentToken = lexer.getNextToken();

  assert.deepEqual(commentToken, {
    text: "-- this is some comment",
    symbol: Symbols.COMMENT,
    start_index: 0,
    end_index: 22,
  });
});
test("lexer.getNextToken returns a number followed by a comment correctly", (assert) => {
  const lexer = new Lexer(paths.number_followed_by_comment);
  const numberToken = lexer.getNextToken();

  assert.deepEqual(
    numberToken,
    {
      text: "-123.45",
      symbol: Symbols.NUMBER,
      start_index: 0,
      end_index: 6,
    },
    "Number Token is Correct"
  );

  const commentToken = lexer.getNextToken();

  assert.deepEqual(
    commentToken,
    {
      text: "-- something somment",
      symbol: Symbols.COMMENT,
      start_index: 8,
      end_index: 27,
    },
    "Comment Token is Correct"
  );
});
