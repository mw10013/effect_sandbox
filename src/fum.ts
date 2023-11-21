import { Config, Effect } from "effect";
// import * as Http from "@effect/platform/HttpClient";
import { HttpClient } from "@effect/platform";

const program = Effect.gen(function* (_) {
  const accessToken = yield* _(
    Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
  );
  yield* _(Effect.logInfo(`accessToken: ${accessToken}`));

  const request = HttpClient.request
    .get("https://api.hubapi.com/crm/v3/objects/contacts/1?archived=false")
    .pipe(HttpClient.request.bearerToken(accessToken));
  console.log("request: %o", request);

  const response = yield* _(
    request,
    HttpClient.client.fetch(),
    Effect.flatMap((res) => res.json)
  );
  console.log("response: %o", response);
});

await Effect.runPromise(program).then(console.log, console.error);
