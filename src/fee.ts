import { Effect, Config, Context, Layer } from "effect";

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
  const service = yield* _(NameService);
  const name = yield* _(service.getName);
  console.log(`Hello ${name}!`);
  const hubspotApiKey = yield* _(
    Effect.config(Config.string("HUBSPOT_API_KEY1"))
  );
  console.log(`hubspotApiKey: ${hubspotApiKey}`);
});

const main = Effect.provide(program, NameServiceLive);

Effect.runSync(main);

// $ExpectType Effect<never, ConfigError, void>
// const program = Effect.gen(function* (_) {
//   const hubspotApiKey = yield* _(
//     Effect.config(Config.string("HUBSPOT_API_KEY"))
//   );
//   console.log(`hubspotApiKey: ${hubspotApiKey}`);
// });

// Effect.runSync(program);
