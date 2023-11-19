import { Config, Console, Effect, LogLevel, Logger, pipe } from "effect";

// const contact = await (async (accessToken) => {
//     if (!accessToken) {
//       return null;
//     }
//     const response = await fetch(
//       `https://api.hubapi.com/crm/v3/objects/contacts/1?archived=false`,
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       },
//     );
//     await assertResponseOk(response);
//     return await response.json();
//   })(await getAccessToken({session, env}));



const fetchContact = (accessToken: string) =>
  Effect.tryPromise({
    try: () =>
      fetch(`https://api.hubapi.com/crm/v3/objects/contacts/1?archived=false`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    catch: () => "fetch" as const,
  });

const getJson = (res: Response) =>
  Effect.tryPromise({
    try: () => res.json() as Promise<unknown>, // Promise<any> otherwise
    catch: () => "json" as const,
  });

const program = Effect.gen(function* (_) {
  const accessToken = yield* _(
    Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
  );
  yield* _(Effect.logDebug(`accessToken: ${accessToken}`));
  const response = yield* _(fetchContact(accessToken));
  //   console.log("response: %o", response);
  const json = yield* _(getJson(response));
  yield* _(Console.log("json: %o", json));
  //   throw new Error("Woah");
}).pipe(Logger.withMinimumLogLevel(LogLevel.Debug));

const main = program.pipe(
  Effect.catchAll(() => Console.error("A dreadful error occurred"))
);

Effect.runPromise(main).catch((defect) => {
  console.error("Caught defect:", defect);
  process.exit(1);
});
