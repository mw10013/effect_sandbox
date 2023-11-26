import { pipe, Effect } from "effect";

const increment = (x: number) => x + 1;

const mappedEffect = pipe(
  Effect.succeed(5),
  Effect.map((x) => increment(x))
);

await Effect.runPromise(mappedEffect).then(console.log, console.error);

const divide = (a: number, b: number): Effect.Effect<never, Error, number> =>
  b === 0
    ? Effect.fail(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b);

const flatMappedEffect = pipe(
  //   Effect.succeed([10, 2]),
  Effect.all([Effect.succeed(10), Effect.succeed(2)]),
  Effect.tap(([a, b]) =>
    Effect.sync(() => console.log(`Performing division: ${a} / ${b}`))
  ),
  Effect.flatMap(([a, b]) => divide(a, b))
);

await Effect.runPromise(flatMappedEffect).then(console.log);

const task1 = Effect.promise(() => Promise.resolve(10));
// $ExpectType Effect<never, never, number>
const task2 = Effect.promise(() => Promise.resolve(2));

// $ExpectType Effect<never, Error, string>
const program = pipe(
  Effect.all([task1, task2]),
  Effect.tap(([a, b]) =>
    Effect.sync(() => console.log(`Performing division: ${a} / ${b}`))
  ),
  Effect.flatMap(([a, b]) => divide(a, b)),
  Effect.tap((n) => Effect.sync(() => console.log(`Incrementing: ${n}`))),
  Effect.map((n1) => increment(n1)),
  Effect.map((n2) => `Result is: ${n2}`)
);

Effect.runPromise(program).then(console.log);
