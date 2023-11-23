import { Effect } from "effect";
import * as NodeFS from "node:fs"

// const program = Effect.succeed(42);
// const program = Effect.fail("my error");

// const divide = (a: number, b: number): Effect.Effect<never, Error, number> =>
//   b === 0
//     ? Effect.fail(new Error("Cannot divide by zero"))
//     : Effect.succeed(a / b);
// const program = divide(49, 7);

// const program = Effect.sync(() => {
//   console.log("Hello, World!"); // side effect
//   return 42; // return value
// });

// const program = Effect.try({
//   try: () => JSON.parse(""), // JSON.parse may throw for bad input
//   catch: (unknown) => new Error(`something went wrong ${unknown}`), // remap the error
// });

// const program = Effect.promise<string>(
//   () =>
//     new Promise((resolve) => {
//       setTimeout(() => {
//         resolve("Async operation completed successfully!");
//       }, 2000);
//     })
// );

const program = Effect.async<never, Error, Buffer>((resume) => {
    NodeFS.readFile("todos.txt", (error, data) => {
      if (error) {
        resume(Effect.fail(error))
      } else {
        resume(Effect.succeed(data))
      }
    })
  })

console.log("program: %o", program);
await Effect.runPromise(program).then(console.log, console.error);
await Effect.runPromise(program).then(console.log, console.error);
