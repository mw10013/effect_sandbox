import { Config, Effect, pipe } from "effect";

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
  const response = yield* _(fetchContact(accessToken));
  console.log("response: %o", response);
  const json = yield* _(getJson(response));
  console.log("json: %o", json);
});

Effect.runPromise(program).catch((err) => console.error("err:", err));
