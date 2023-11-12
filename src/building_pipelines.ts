import { pipe, Effect } from "effect";

const increment = (x: number) => x + 1;

// $ExpectType Effect<never, never, number>
const mappedEffect = pipe(
  Effect.succeed(5),
  Effect.map((x) => increment(x))
);

// Effect.runPromise(mappedEffect).then(console.log); // Output: 6
const result = await Effect.runPromise(mappedEffect); // Output: 6
console.log("result:", result);

const divide = (a: number, b: number): Effect.Effect<never, Error, number> =>
  b === 0
    ? Effect.fail(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b);

// $ExpectType Effect<never, Error, number>
const flatMappedEffect = pipe(
  Effect.succeed([10, 2]),
  Effect.tap(([a, b]) =>
    Effect.sync(() => console.log(`Will perform division: ${a} / ${b}`))
  ),
  Effect.flatMap(([a, b]) => divide(a, b))
);

// Effect.runPromise(flatMappedEffect).then(console.log); // Output: 5
const resultFlat = await Effect.runPromise(flatMappedEffect);
console.log("resultFlat:", resultFlat);

const incrementBy2 = (x: number) => Effect.succeed(x + 2);

// $ExpectType Effect<never, never, number>
const mappedEffect1 = pipe(
  Effect.succeed([5]),
  Effect.flatMap(([x]) => incrementBy2(x))
);

Effect.runPromise(mappedEffect1).then(console.log); // Output: 6
