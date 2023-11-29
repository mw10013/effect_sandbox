import { Config, ConfigError, Context, Effect, Layer } from "effect";
import { HttpClient } from "@effect/platform";
import * as Schema from "@effect/schema/Schema";
import { ParseResult } from "@effect/schema";
import { filterStatusOk } from "@effect/platform/Http/Client";

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

export const HubspotServiceLive = Layer.effect(
  HubspotService,
  Effect.gen(function* (_) {
    const config = yield* _(Effect.config(hubspotConfig));
    const defaultClient = yield* _(HttpClient.client.Client);
    const client = defaultClient.pipe(
      HttpClient.client.mapRequest(
        HttpClient.request.bearerToken(config.privateAccessToken)
      ),
      HttpClient.client.tapRequest((request) =>
        Effect.sync(() => console.log("tapRequest: %o", request))
      ),
      // HttpClient.client.filterStatusOk
      // HttpClient.client.transform((effect, request) =>
      //   Effect.filterOrFail(
      //     effect,
      //     (response) => response.status >= 200 && response.status < 300,
      //     (response) =>
      //       HttpClient.error.ResponseError({
      //         request,
      //         response,
      //         reason: "StatusCode",
      //         error: `non 2xx status code (${response.status})`,
      //       })
      //   )
      // )
      HttpClient.client.filterStatusOk
    );

    const getContact: HubspotService["getContact"] = () =>
      Effect.gen(function* (_) {
        return yield* _(
          HttpClient.request.get(
            `${config.apiUrl}objectsss/contacts/1?archived=false`
          ),
          client,
          Effect.flatMap(HttpClient.response.schemaBodyJson(ContactResponse))
        );
      });
    return HubspotService.of({ getContact });
  })
);

const blueprint = Effect.gen(function* (_) {
  const hubspotService = yield* _(HubspotService);
  return yield* _(hubspotService.getContact());
});

const runnable = Effect.provide(
  blueprint,
  HttpClient.client.layer.pipe(Layer.provide(HubspotServiceLive))
);

await Effect.runPromise(runnable).then(console.log, (reason) =>
  console.error("error: %o", reason)
);
