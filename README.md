# bigi

## Goal

The goal of this project is to be a Domain Specific Language for all that
web shit that I am sick and tired of having to write _just differently enough_
that I need new code every time.

Success for this project means

- There is a transpiler

  - Bigi -> Target Language

    - Not sure the target language
    - Probably Typescript/Javascript since
      that is what I know.

  - It can be configured via toml file
  - There is a tutorial on how to write file
  - There is a CLI tool to init a project

- It has shipped an application
  - That application has a tutorial
  - That application can be ran locally or remotely
  - That application is live on a commodity Cloud
  - That application has
    - authentication/authorization
    - CRUD over
      - Posts
      - Users
      - Comments
      - Reactions

## Language Features

> These are the current features that have a test associated with
> it that the lexer can understand and parse correctly. You can find
> the test suite inside of `src/lexer.test.ts`
>
> As more features are added to the Lexer and Parser, this list will
> be updated

- Numbers

  - Negative and Positive
  - Integer and Decimal

- Commas
- White Space
- End of File
- Reference
- Comments
  - `--` starts a comment
  - Both as a whole line and at the end of a line
    - `-- this is a comment line`
    - `-123.45 -- this is a comment, that is a number`
- Single Quoted Strings
  - `'this would be a string'`
  - `'this would be a string' -- and this a comment`
  - `'this would throw an error because it is not closed`
  - `'this would work because it\'s escaped'`
