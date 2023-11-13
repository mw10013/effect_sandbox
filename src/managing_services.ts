import { Effect, Context } from "effect";

export interface Random {
  readonly next: Effect.Effect<never, never, number>;
}

export const Random = Context.Tag<Random>();
 
// $ExpectType Effect<Random, never, void>
const program = Effect.gen(function* (_) {
  const random = yield* _(Random)
  const randomNumber = yield* _(random.next)
  console.log(`random number: ${randomNumber}`)
})

// $ExpectType Effect<never, never, void>
const runnable = Effect.provideService(
    program,
    Random,
    Random.of({
      next: Effect.sync(() => Math.random())
    })
  )
   
  Effect.runPromise(runnable)
  /*
  Output:
  random number: 0.8241872233134417
  */