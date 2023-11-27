import { Config, ConfigError, Context, Effect, Layer } from "effect";
import { HttpClient } from "@effect/platform";
import * as Schema from "@effect/schema/Schema";
import { ParseResult } from "@effect/schema";

export const ContactResponse = Schema.struct({
  id: Schema.number,
  properties: Schema.struct({
    email: Schema.string,
    firstname: Schema.string,
    lastname: Schema.string,
  }),
});

export type ContactResponse = Schema.Schema.To<typeof ContactResponse>;

export class HubspotConfig {
  constructor(readonly privateAccessToken: string, readonly apiUrl: string) {}
}

export const hubspotConfig = Config.all([
  Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"),
  Config.string("HUBSPOT_API_URL"),
]).pipe(Config.map(([apiKey, apiUrl]) => new HubspotConfig(apiKey, apiUrl)));

export interface HubspotService {
  readonly getContact: () => Effect.Effect<
    never,
    | ConfigError.ConfigError
    | HttpClient.body.BodyError
    | HttpClient.error.RequestError
    | HttpClient.error.ResponseError
    | ParseResult.ParseError,
    ContactResponse
  >;
}

export const HubspotService = Context.Tag<HubspotService>(
  "@app/HubspotService"
);

export const HubspotServiceLive = Layer.succeed(
  HubspotService,
  HubspotService.of({
    getContact: () =>
      Effect.gen(function* (_) {
        const config = yield* _(Effect.config(hubspotConfig));
        const request = HttpClient.request
          .get(`${config.apiUrl}objects/contacts/1?archived=false`)
          .pipe(HttpClient.request.bearerToken(config.privateAccessToken));
        console.log("request: %o", request);

        return yield* _(
          request,
          HttpClient.client.fetch(),
          Effect.flatMap(HttpClient.response.schemaBodyJson(ContactResponse))
        );
      }),
  })
);

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

