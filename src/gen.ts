import { Effect } from "effect";

const task = Effect.sync(() => {
  console.log("Hello, World!");
  return 7;
});

export const program = Effect.gen(function* (_) {
  const t = yield* _(task);
  return `Result is: ${t}`;
});

Effect.runPromise(program).then(console.log, console.error);
