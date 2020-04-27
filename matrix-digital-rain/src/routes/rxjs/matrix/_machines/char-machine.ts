import { assign, Machine, MachineConfig, MachineOptions } from "xstate";
import { interval } from "rxjs";
import { takeWhile } from "rxjs/operators";

const getRandomNumber = (min: number = 0, max: number = 128) =>
  Math.random() * (max - min) + min;
const getRandomChar = () => String.fromCharCode(getRandomNumber());
const getTime = (): number => {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
};

interface CharMachineContext {
  changeChance: number;
  char: string;
  color: string;
  createdAt: number;
  maxLifeSpan: number;
  opacity: number;
}

const getInitialContext = (): CharMachineContext => ({
  changeChance: getRandomNumber(0.005, 0.05),
  char: getRandomChar(),
  color: "white",
  createdAt: getTime(),
  maxLifeSpan: 5000,
  opacity: getRandomNumber(0.85, 1),
});

const charMachineConfig: MachineConfig<CharMachineContext, any, any> = {
  id: "char",

  initial: "init",

  context: { ...getInitialContext() },

  states: {
    init: {
      on: {
        "": "changingColor",
      },
    },

    changingColor: {
      entry: ["setChangeColorOpacity"],

      invoke: {
        id: "changing-color-interval-service",
        src: "intervalService",

        onDone: [
          {
            cond: "colorChangeComplete",
            actions: ["setFinalColor"],
            target: "looping",
          },
          {
            target: "changingColor",
          },
        ],
      },
    },

    looping: {
      entry: ["setFinalColor"],
      invoke: {
        id: "looping-interval-service",

        src: "intervalService",

        onDone: [
          {
            cond: "loopingComplete",
            target: "fading",
          },
          {
            actions: ["maybeChangeChar", "maybeChangeOpacity"],
            target: "looping",
          },
        ],
      },
    },

    fading: {
      invoke: {
        id: "fading-interval-service",

        src: "intervalService",

        onDone: [
          {
            cond: "fadingComplete",
            target: "complete",
          },
          {
            actions: ["fade"],
            target: "fading",
          },
        ],
      },
    },

    complete: {
      type: "final",
    },
  },
};

const charMachineOptions: Partial<MachineOptions<CharMachineContext, any>> = {
  actions: {
    setFinalColor: assign({
      color: "green",
    }),

    maybeChangeChar: assign({
      char: ctx => {
        const shouldChangeChar = Math.random() < ctx.changeChance;

        return shouldChangeChar ? getRandomChar() : ctx.char;
      },
    }),

    maybeChangeOpacity: assign({
      opacity: ctx => {
        const shouldChangeOpacity = Math.random() < ctx.changeChance;

        return shouldChangeOpacity
          ? Math.max(0, getRandomNumber(-0.15, 0.15) + ctx.opacity)
          : ctx.opacity;
      },
    }),

    fade: assign({
      opacity: ctx => Math.max(0, ctx.opacity - 0.1),
    }),

    setChangeColorOpacity: assign({
      opacity: getRandomNumber(0.85, 1),
    }),
  },

  guards: {
    colorChangeComplete: ctx => {
      return getTime() - ctx.createdAt > ctx.maxLifeSpan * 0.05;
    },

    loopingComplete: ctx => {
      return getTime() - ctx.createdAt > ctx.maxLifeSpan * 0.3;
    },

    fadingComplete: ctx => {
      return ctx.opacity === 0;
    },
  },

  services: {
    intervalService: ctx => interval(100).pipe(takeWhile(() => false)),
  },
};

const createCharMachine = () =>
  Machine<CharMachineContext>(
    charMachineConfig,
    charMachineOptions
  ).withContext({ ...getInitialContext(), char: getRandomChar() });

export { createCharMachine };
