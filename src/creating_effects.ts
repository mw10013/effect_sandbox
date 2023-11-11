import { Effect } from "effect";

const divide = (a: number, b: number): Effect.Effect<never, Error, number> =>
  b === 0
    ? Effect.fail(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b);

// $ExpectType Effect<never, never, number>
const program = Effect.sync(() => {
  console.log("Hello, World!"); // side effect
  return 42; // return value
});

// $ExpectType number
const result = Effect.runSync(program);
// Output: Hello, World!

console.log(result);
// Output: 42


Effect.runPromise(Effect.succeed(1)).then(console.log) // Output: 1