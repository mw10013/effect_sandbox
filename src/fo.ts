import { Config, Console, Effect, LogLevel, Logger } from "effect";

const program = Effect.gen(function* (_) {
  const accessToken = yield* _(
    Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
  );
  yield* _(Effect.logDebug(`accessToken: ${accessToken}`));
}).pipe(Logger.withMinimumLogLevel(LogLevel.Debug));

const main = program.pipe(
  Effect.catchAll(() => Console.error("A dreadful error occurred"))
);

Effect.runPromise(main).catch((defect) => {
  console.error("Caught defect:", defect);
  process.exit(1);
});
