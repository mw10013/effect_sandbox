import { Config, Effect } from "effect";
import * as Http from "@effect/platform/HttpClient";

const program = Effect.gen(function* (_) {
  const accessToken = yield* _(
    Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
  );
  yield* _(Effect.logInfo(`accessToken: ${accessToken}`));

  const request = Http.request
    .get("https://api.hubapi.com/crm/v3/objects/contacts/1?archived=false")
    .pipe(Http.request.bearerToken(accessToken));
  console.log("request: %o", request);

  const response = yield* _(
    request,
    Http.client.fetch(),
    Effect.flatMap((res) => res.json)
  );
  console.log("response: %o", response);
});

await Effect.runPromise(program).then(console.log, console.error);
