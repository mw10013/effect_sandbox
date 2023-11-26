import { Effect, Random } from "effect";

const task = Effect.sync(() => {
  console.log("Hello, World!");
  return 7;
});

export const program = Effect.gen(function* (_) {
  //   const t = yield* _(task);
  //   return `Result is: ${t}`;
  const n = yield* _(
    // Random.next,
    // Effect.map((n) => n * 2)
    7,
    (n) => n * 2,
    (n) => Effect.succeed(n + 1)
  );
  return n;
});

Effect.runPromise(program).then(console.log, console.error);
