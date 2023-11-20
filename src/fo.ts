import { Config, Console, Effect, LogLevel, Logger } from "effect";
import * as Http from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";

// https://gist.github.com/yanisurbis/37c3cf6ffdaf37cb0fa1abe09c05a258

await (async () => {
  // const req = Http.request.get("https://jsonplaceholder.typicode.com/posts/1");
  const req = Http.request
    .get("https://jsonplaceholder.typicode.com/posts")
    .pipe(Http.request.appendUrlParam("userId", "1"));
  console.log("req: %o", req);

  const program = req.pipe(
    Http.client.fetch(),
    Effect.flatMap((res) => res.json)
  );

  await Effect.runPromise(program).then(console.log, console.error);
})();

await (async () => {
  const req = Http.request.get("https://jsonplaceholder.typicode.com/posts/1");
  console.log("req: %o", req);

  const Post = Schema.struct({
    userId: Schema.number,
    id: Schema.number,
    title: Schema.string,
    body: Schema.string,
  });

  const program = req.pipe(
    Http.client.fetch(),
    Effect.flatMap(Http.response.schemaBodyJson(Post))
  );

  await Effect.runPromise(program).then(console.log).catch(console.error);
})();

await (async () => {
  const req = Http.request
    .post("https://jsonplaceholder.typicode.com/posts")
    .pipe(
      Http.request.setHeader("Content-type", "application/json; charset=UTF-8"),
      Http.request.jsonBody({
        title: "foo",
        body: "bar",
        userId: 1,
      })
    );
  console.log("req: %o", req);

  const program = req.pipe(
    Effect.flatMap(Http.client.fetch()),
    Effect.flatMap((res) => res.json)
  );

  await Effect.runPromise(program).then(console.log, console.error);
})();

await (async () => {
  const req = Http.request.get(
    "https://api.hubapi.com/crm/v3/objects/contacts/1?archived=false"
  );
  console.log("req: %o", req);

  //   const program = req.pipe(
  //     Http.client.fetch(),
  //     Effect.flatMap((res) => res.json)
  //   );

  const program = Effect.gen(function* (_) {
    const accessToken = yield* _(
      Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
    );
    yield* _(Effect.logInfo(`accessToken: ${accessToken}`));
    const response = yield* _(
      req,
      Http.client.fetch(),
      Effect.flatMap((res) => res.json)
    );
    console.log("response: %o", response);
  });

  await Effect.runPromise(program).then(console.log, console.error);
})();

// const program = Effect.gen(function* (_) {
//   const accessToken = yield* _(
//     Effect.config(Config.string("HUBSPOT_PRIVATE_ACCESS_TOKEN"))
//   );
//   yield* _(Effect.logDebug(`accessToken: ${accessToken}`));
// }).pipe(Logger.withMinimumLogLevel(LogLevel.Debug));

// const main = program.pipe(
//   Effect.catchAll(() => Console.error("A dreadful error occurred"))
// );

// Effect.runPromise(main).catch((defect) => {
//   console.error("Caught defect:", defect);
//   process.exit(1);
// });
