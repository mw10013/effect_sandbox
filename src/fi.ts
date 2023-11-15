import { Effect, pipe } from "effect";

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

const id = "97459c0045f373f4eaf126998d8f65dc";

const fetchContact = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`https://api.github.com/gists/${id}`),
    catch: () => "fetch" as const,
  }); // Effect.Effect<never, "fetch", Response>

const getJson = (res: Response) =>
  Effect.tryPromise({
    try: () => res.json() as Promise<unknown>, // Promise<any> otherwise
    catch: () => "json" as const,
  }); // Effect.Effect<never, "json", unknown>

const getAndParseGist = pipe(
  // Effect.Effect<never, 'fetch', Response>
  fetchContact(id)

  // Effect.Effect<never, 'fetch' | 'json', unknown>
  // Effect.flatMap(getJson),

  // Effect.Effect<never, 'fetch' | 'json' | DecodeError, Gist>
  // Effect.flatMap(parseEither(GistSchema)),
);

// Effect.runPromise(getAndParseGist)
//   .then((x) => console.log("decoded gist %o", x))
//   .catch((err) => console.error(err));

const program = Effect.gen(function* (_) {
  const response = yield* _(fetchContact(id));
  console.log("response: %o", response);
});

Effect.runPromise(program).catch((err) => console.error(err));
