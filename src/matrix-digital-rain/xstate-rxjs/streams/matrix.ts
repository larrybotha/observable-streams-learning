import { combineLatest, interval, of } from "rxjs";
import { scan, map, startWith, switchMap } from "rxjs/operators";

enum Color {
  initial = "white",
  final = "green",
}

if (typeof performance === "undefined" && global) {
  (global as any).performance = {
    now() {
      return new Date();
    },
  };
}

const getRandomNumber = (min: number = 0, max: number = 255) =>
  Math.random() * (max - min) + min;
const getRandomChar = () => String.fromCharCode(getRandomNumber());

const getTime = (): number => {
  return performance ? performance.now() : Date.now();
};

const createChar$ = (maxLifeSpan: number) =>
  of({
    char: getRandomChar(),
    color: Color.initial,
    opacity: getRandomNumber(0.85, 1),
    changeChance: getRandomNumber(0.05, 0.3),
    createdAt: getTime(),
    maxLifeSpan,
  });

const matrix$ = combineLatest(createChar$(5000), interval(1000)).pipe(
  scan(([ch, n]) => {
    console.log(ch);
    const char = {
      ...ch,
      updatedAt: getTime(),
    };

    return [char, n];
  }),
  map(([char]) => char)
);

export { matrix$ };
