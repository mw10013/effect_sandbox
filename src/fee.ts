import { Effect, Config, Context, Layer, Console } from "effect";

export interface Random {
  readonly next: Effect.Effect<never, never, number>;
}

export const Random = Context.Tag<Random>();

export const RandomLive = Layer.succeed(
  Random,
  Random.of({
    next: Effect.sync(() => Math.random()),
  })
);

export const RandomTest = Layer.succeed(
  Random,
  Random.of({
    next: Effect.sync(() => 7),
  })
);

interface Logger {
  readonly log: (message: string) => Effect.Effect<never, never, void>;
}

const Logger = Context.Tag<Logger>();

export interface NameService {
  readonly getName: Effect.Effect<never, never, string>;
}

// Tag<NameService>
export const NameService = Context.Tag<NameService>();

// Layer<never, never, NameService>
export const NameServiceLive = Layer.succeed(
  NameService,
  NameService.of({
    getName: Effect.succeed("World"),
  })
);

export const program = Effect.gen(function* (_) {
  const random = yield* _(Random);
  const logger = yield* _(Logger);
  const randomNumber = yield* _(random.next);
  yield* _(logger.log(String(randomNumber)));
  // console.log(`Random number: ${randomNumber}`);

  const service = yield* _(NameService);
  const name = yield* _(service.getName);
  console.log(`Hello ${name}!`);
  const hubspotApiKey = yield* _(
    Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
  );
  console.log(`hubspotApiKey: ${hubspotApiKey}`);
});

// const runnable = Effect.provideService(
//   program,
//   Random,
//   Random.of({
//     next: Effect.sync(() => Math.random()),
//   })
// );
// const runnable = Effect.provide(program, RandomLive);
// const runnable = Effect.provide(program, RandomTest);

const context = Context.empty().pipe(
  Context.add(Random, Random.of({ next: Effect.sync(() => Math.random()) })),
  Context.add(Logger, Logger.of({ log: Console.log })),
  Context.add(NameService, NameService.of({ getName: Effect.succeed("World") }))
);
const runnable = Effect.provide(program, context);

Effect.runSync(runnable);

// const main = Effect.provide(program, NameServiceLive);
// Effect.runSync(main);

// $ExpectType Effect<never, ConfigError, void>
// const program = Effect.gen(function* (_) {
//   const hubspotApiKey = yield* _(
//     Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
//   );
//   console.log(`hubspotApiKey: ${hubspotApiKey}`);
// });

// Effect.runSync(program);
