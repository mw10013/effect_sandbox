import { Config, ConfigError, Context, Effect, Layer } from "effect";
import { HttpClient } from "@effect/platform";
import * as Http from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";
import { ParseResult } from "@effect/schema";

// https://gist.github.com/yanisurbis/37c3cf6ffdaf37cb0fa1abe09c05a258

export const ContactResponse = Schema.struct({
  id: Schema.string,
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
    | HttpClient.error.HttpClientError
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
        return yield* _(
          HttpClient.request.get(
            `${config.apiUrl}objects/contacts/1?archived=false`
          ),
          HttpClient.request.bearerToken(config.privateAccessToken),
          (request) => {
            console.log("request: %o", request);
            return request;
          },
          HttpClient.client.fetch(),
          Effect.flatMap(HttpClient.response.schemaBodyJson(ContactResponse))
        );
      }),
  })
);

const blueprint = Effect.gen(function* (_) {
  const hubspotService = yield* _(HubspotService);
  return yield* _(hubspotService.getContact());
});

const runnable = blueprint.pipe(Effect.provide(HubspotServiceLive));

await Effect.runPromise(runnable).then(console.log, (reason) =>
  console.error("error: %o", reason)
);

const bp = Effect.gen(function* (_) {
  const defaultClient = yield* _(Http.client.Client);
  console.log("defaultClient: %o", defaultClient);

  const client = defaultClient.pipe(HttpClient.client.filterStatusOk);
  const config = yield* _(Effect.config(hubspotConfig));
  return yield* _(
    HttpClient.request.get(`${config.apiUrl}objects/contacts/1?archived=false`),
    HttpClient.request.bearerToken(config.privateAccessToken),
    (request) => {
      console.log("request: %o", request);
      return request;
    },
    defaultClient.pipe(HttpClient.client.filterStatusOk),
    Effect.flatMap(HttpClient.response.schemaBodyJson(ContactResponse))
  );
});

const r = Effect.provide(bp, HttpClient.client.layer);

await Effect.runPromise(r).then(console.log, console.error);
