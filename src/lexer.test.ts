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
  faulty_string: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.faulty_string.bigi"
  ),
  string: path.resolve(__dirname, "..", "artifacts", "test.string.bigi"),
  multiple_lines_of_strings: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.multiple_lines_of_strings.bigi"
  ),
  escaped_string: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.escaped_string.bigi"
  ),
  let_dec: path.resolve(__dirname, "..", "artifacts", "test.let_dec.bigi"),
  minus_operator: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.minus_operator.bigi"
  ),
  addition_operator: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.addition_operator.bigi"
  ),
  division_operator: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.division_operator.bigi"
  ),
  modulus_operator: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.modulus_operator.bigi"
  ),
  multiplication_operator: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.multiplication_operator.bigi"
  ),
  empty_data: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.empty_data.bigi"
  ),
  full_data: path.resolve(__dirname, "..", "artifacts", "test.full_data.bigi"),
  filtered_data: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.filtered_data.bigi"
  ),

  multi_filtered_data: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.multi_filtered_data.bigi"
  ),

  function_call: path.resolve(
    __dirname,
    "..",
    "artifacts",
    "test.function_call.bigi"
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

test("lexer.getNextToken returns a String Token for a single-quote string", (assert) => {
  const lexer = new Lexer(paths.string);
  const stringToken = lexer.getNextToken();

  assert.deepEqual(stringToken, {
    text: `'some string that I am creating'`,
    symbol: Symbols.STRING,
    start_index: 0,
    end_index: `'some string that I am creating'`.length - 1,
  });
});

test("lexer.getNextToken throws an error if given a string that does not terminate", (assert) => {
  assert.plan(1);
  const lexer = new Lexer(paths.faulty_string);

  try {
    lexer.getNextToken();
  } catch (e) {
    assert.truthy(e instanceof Errors.StringNotClosed);
  }
});

test("lexer.getNextToken processes multiple lines of strings correctly", (assert) => {
  /**
    'this is a valid line'
    'this is another one'
    '' -- even this one
    ' but not this one
   */

  assert.plan(5);

  const lexer = new Lexer(paths.multiple_lines_of_strings);

  const line1 = lexer.getNextToken();
  assert.deepEqual(line1, {
    text: `'this is a valid line'`,
    start_index: 0,
    end_index: `'this is a valid line'`.length - 1,
    symbol: Symbols.STRING,
  });

  const line2 = lexer.getNextToken();
  assert.deepEqual(line2, {
    text: `'this is another one'`,
    start_index: line1.end_index + 2,
    end_index: `'this is another one'`.length + line1.end_index + 1,
    symbol: Symbols.STRING,
  });

  const line3String = lexer.getNextToken();
  assert.deepEqual(line3String, {
    text: `''`,
    start_index: line2.end_index + 2,
    end_index: line2.end_index + 3,
    symbol: Symbols.STRING,
  });

  const line3Comment = lexer.getNextToken();

  assert.deepEqual(line3Comment, {
    text: "-- even this one",
    start_index: 48,
    end_index: 63,
    symbol: Symbols.COMMENT,
  });

  try {
    lexer.getNextToken();
  } catch (e) {
    assert.true(e instanceof Errors.StringNotClosed);
  }
});

test("lexer.getNextToken parses escaped strings correctly", (assert) => {
  const lexer = new Lexer(paths.escaped_string);

  const line = lexer.getNextToken();

  assert.deepEqual(line, {
    text: `'this is the tit\'s tit'`,
    symbol: Symbols.STRING,
    start_index: 0,
    end_index: `'this is the tit\\'s tit'`.length - 1,
  });
});

test("lexer.getNextToken parses let declarations correctly", (assert) => {
  const lexer = new Lexer(paths.let_dec);
  /**
   *
   * let foo = 1
   * let foo = '2'
   * let foo = bar
   */
  (() => {
    // line 1
    const token1 = lexer.getNextToken();

    assert.is(token1.symbol, Symbols.RESERVED_SYMBOLS.LET);
    assert.is(token1.text, "let");

    const token2 = lexer.getNextToken();

    assert.is(token2.symbol, Symbols.REFERENCE);
    assert.is(token2.text, "foo");

    const token3 = lexer.getNextToken();
    assert.is(token3.symbol, Symbols.OPERATORS.ASSIGNMENT);
    assert.is(token3.text, "=");

    const token4 = lexer.getNextToken();
    assert.is(token4.symbol, Symbols.NUMBER);
    assert.is(token4.text, "1");
  })();

  (() => {
    // line 2
    const token1 = lexer.getNextToken();

    assert.is(token1.symbol, Symbols.RESERVED_SYMBOLS.LET);
    assert.is(token1.text, "let");

    const token2 = lexer.getNextToken();

    assert.is(token2.symbol, Symbols.REFERENCE);
    assert.is(token2.text, "foo");

    const token3 = lexer.getNextToken();
    assert.is(token3.symbol, Symbols.OPERATORS.ASSIGNMENT);
    assert.is(token3.text, "=");

    const token4 = lexer.getNextToken();
    assert.is(token4.symbol, Symbols.STRING);
    assert.is(token4.text, "'2'");
  })();

  (() => {
    // line 3
    const token1 = lexer.getNextToken();

    assert.is(token1.symbol, Symbols.RESERVED_SYMBOLS.LET);
    assert.is(token1.text, "let");

    const token2 = lexer.getNextToken();

    assert.is(token2.symbol, Symbols.REFERENCE);
    assert.is(token2.text, "foo");

    const token3 = lexer.getNextToken();
    assert.is(token3.symbol, Symbols.OPERATORS.ASSIGNMENT);
    assert.is(token3.text, "=");

    const token4 = lexer.getNextToken();
    assert.is(token4.symbol, Symbols.REFERENCE);
    assert.is(token4.text, "bar");
  })();
});

test("lexer.getNextToken parses the subtraction operator correctly", (assert) => {
  const lexer = new Lexer(paths.minus_operator);
  /**
   *
   * 1 - 2
   */
  const expectations = [
    {
      symbol: Symbols.NUMBER,
      text: "1",
    },
    {
      symbol: Symbols.OPERATORS.SUBTRACTION,
      text: "-",
    },
    {
      symbol: Symbols.NUMBER,
      text: "2",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses the addition operator correctly", (assert) => {
  const lexer = new Lexer(paths.addition_operator);
  /**
   *
   * 1 + 2
   */
  const expectations = [
    {
      symbol: Symbols.NUMBER,
      text: "1",
    },
    {
      symbol: Symbols.OPERATORS.ADDITION,
      text: "+",
    },
    {
      symbol: Symbols.NUMBER,
      text: "2",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses the division operator correctly", (assert) => {
  const lexer = new Lexer(paths.division_operator);
  /**
   *
   * foo / bar
   */
  const expectations = [
    {
      symbol: Symbols.REFERENCE,
      text: "foo",
    },
    {
      symbol: Symbols.OPERATORS.DIVISION,
      text: "/",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "bar",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses the modulus operator correctly", (assert) => {
  const lexer = new Lexer(paths.modulus_operator);
  /**
   *
   * foo % bar
   */
  const expectations = [
    {
      symbol: Symbols.REFERENCE,
      text: "foo",
    },
    {
      symbol: Symbols.OPERATORS.MODULUS,
      text: "%",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "bar",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses the multiplication operator correctly", (assert) => {
  const lexer = new Lexer(paths.multiplication_operator);
  /**
   *
   * foo * bar
   */

  const expectations = [
    {
      symbol: Symbols.REFERENCE,
      text: "foo",
    },
    {
      symbol: Symbols.OPERATORS.MULTIPLICATION,
      text: "*",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "bar",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses empty data blocks correctly", (assert) => {
  const lexer = new Lexer(paths.empty_data);
  /**
   *
   * data Foo {}
   */

  const expectations = [
    {
      symbol: Symbols.RESERVED_SYMBOLS.DATA,
      text: "data",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Foo",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.OPEN_CURLY_BRACKET,
      text: "{",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.CLOSE_CURLY_BRACKET,
      text: "}",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses full data blocks correctly", (assert) => {
  const lexer = new Lexer(paths.full_data);

  const expectations = [
    {
      symbol: Symbols.RESERVED_SYMBOLS.DATA,
      text: "data",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Foo",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.OPEN_CURLY_BRACKET,
      text: "{",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "name",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.COLON_SEPARATOR,
      text: ":",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Text",
    },
    {
      symbol: Symbols.COMMA,
      text: ",",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "age",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.COLON_SEPARATOR,
      text: ":",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Int",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.CLOSE_CURLY_BRACKET,
      text: "}",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses data blocks with filters correctly", (assert) => {
  const lexer = new Lexer(paths.filtered_data);

  const expectations = [
    {
      symbol: Symbols.RESERVED_SYMBOLS.DATA,
      text: "data",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Foo",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.OPEN_CURLY_BRACKET,
      text: "{",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "name",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.COLON_SEPARATOR,
      text: ":",
    },
    {
      symbol: Symbols.REFERENCE_WITH_FILTER_ATTACHED,
      text: "Text::Max50",
    },
    {
      symbol: Symbols.COMMA,
      text: ",",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "age",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.COLON_SEPARATOR,
      text: ":",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Int",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.CLOSE_CURLY_BRACKET,
      text: "}",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses data blocks with many filters correctly", (assert) => {
  const lexer = new Lexer(paths.multi_filtered_data);

  const expectations = [
    {
      symbol: Symbols.RESERVED_SYMBOLS.DATA,
      text: "data",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "Foo",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.OPEN_CURLY_BRACKET,
      text: "{",
    },
    {
      symbol: Symbols.REFERENCE,
      text: "name",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.COLON_SEPARATOR,
      text: ":",
    },
    {
      symbol: Symbols.REFERENCE_WITH_FILTER_ATTACHED,
      text: "Text::Max50::Markdown::AnotherOne",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.CLOSE_CURLY_BRACKET,
      text: "}",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});

test("lexer.getNextToken parses function calls correctly", (assert) => {
  const lexer = new Lexer(paths.function_call);

  const expectations = [
    {
      symbol: Symbols.REFERENCE,
      text: "foo",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.OPEN_CAROT_BRACKET,
      text: "<",
    },
    {
      symbol: Symbols.NUMBER,
      text: "1",
    },
    {
      symbol: Symbols.COMMA,
      text: ",",
    },
    {
      symbol: Symbols.NUMBER,
      text: "2",
    },
    {
      symbol: Symbols.RESERVED_SYMBOLS.CLOSE_CAROT_BRACKET,
      text: ">",
    },
  ];

  for (const expectation of expectations) {
    const token = lexer.getNextToken();

    assert.is(expectation.symbol, token.symbol);
    assert.is(expectation.text, token.text);
  }
});
