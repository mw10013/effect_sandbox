import { dual, pipe } from "effect/Function";
import { pipeArguments, type Pipeable } from "effect/Pipeable";

const TypeId = Symbol.for("effect_sandbox/Pipsqueak");
type TypeId = typeof TypeId;

interface Pipsqueak extends Pipeable {
  readonly [TypeId]: TypeId;
  readonly aString: string;
  readonly aNumber: number;
}

class PipsqueakImpl implements Pipsqueak {
  readonly [TypeId]: TypeId;
  constructor(readonly aString: string, readonly aNumber: number) {
    this[TypeId] = TypeId;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}

const isPipsqueak = (u: unknown): u is Pipsqueak =>
  typeof u === "object" && u !== null && TypeId in u;

const empty: Pipsqueak = new PipsqueakImpl("", 0);

const setString = dual<
  (s: string) => (self: Pipsqueak) => Pipsqueak,
  (self: Pipsqueak, s: string) => Pipsqueak
>(2, (self, s) => new PipsqueakImpl(s, self.aNumber));

const setNumber = dual<
  (n: number) => (self: Pipsqueak) => Pipsqueak,
  (self: Pipsqueak, n: number) => Pipsqueak
>(2, (self, n) => new PipsqueakImpl(self.aString, n));

const increment = dual<
  (inc: number) => (self: Pipsqueak) => Pipsqueak,
  (self: Pipsqueak, inc: number) => Pipsqueak
>(2, (self, inc) => new PipsqueakImpl(self.aString, self.aNumber + inc));

const p = empty.pipe(setString("a"), setNumber(1), increment(1));
console.log("p: %o", p);
console.log("isPipsqueak:", isPipsqueak(p));

console.log("pipe:", pipe(empty, setString("a"), setNumber(1), increment(1)));
