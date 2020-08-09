import {actions, send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    augmentingPhaseDuration: {};
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  resetDelay: number;
  lastResetTime: number;
  phaseAugmentation: number;
}

type AugmentPhaseDurationEvent = {
  type: 'AUGMENT_PHASE_DURATION';
  data: number;
};

type ResetEvent = {
  type: 'RESET';
};

type OscillatorEvent = AugmentPhaseDurationEvent | ResetEvent;

const {cancel} = actions;

const config: MachineConfig<OscillatorContext, OscillatorSchema, OscillatorEvent> = {
  id: 'oscillator',

  initial: 'oscillating',

  context: {
    resetDelay: 10000,
    lastResetTime: Date.now(),
    phaseAugmentation: 0,
  },

  on: {
    AUGMENT_PHASE_DURATION: [
      {cond: 'willCompletePhase', target: 'resetting'},
      {target: 'augmentingPhaseDuration'},
    ],
  },

  states: {
    augmentingPhaseDuration: {
      entry: ['augmentingPhaseDuration'],

      on: {'': 'oscillating'},
    },

    resetting: {
      entry: ['resetPhase', 'onReset'],

      on: {'': 'oscillating'},
    },

    oscillating: {
      entry: ['queueReset'],
      exit: ['cancelDelayedReset'],

      on: {RESET: 'resetting'},
    },
  },
};

const options: Partial<MachineOptions<OscillatorContext, OscillatorEvent>> = {
  actions: {
    queueReset: send(
      {type: 'RESET'},
      {
        delay: ({lastResetTime, resetDelay, phaseAugmentation}) => {
          const timeNow = Date.now();
          const augmentedTime = lastResetTime + phaseAugmentation;
          const timeSinceLastReset = timeNow - augmentedTime;
          const delay = Math.max(0, resetDelay - timeSinceLastReset);

          return delay;
        },
        id: 'queued-reset',
      },
    ),

    augmentPhaseDuration: assign(({phaseAugmentation, resetDelay, lastResetTime}, event) => {
      const {data: augmentation} = event as AugmentPhaseDurationEvent;
      const ratioOfDuration = augmentation / resetDelay;
      const radiansToAdd = (Math.PI / 2) * ratioOfDuration;
      const currentRadians =
        ((Math.PI / 2) * (Date.now() - (lastResetTime + phaseAugmentation))) / resetDelay;
      const newAugmentation = resetDelay - Math.sin(currentRadians + radiansToAdd) * resetDelay;

      return {
        phaseAugmentation: newAugmentation,
      };
    }),

    cancelDelayedReset: cancel('queued-reset'),

    resetPhase: assign(() => {
      return {
        lastResetTime: Date.now(),
        phaseAugmentation: 0,
      };
    }),

    onReset: () => {},
  },

  guards: {
    willCompletePhase: ({phaseAugmentation, lastResetTime, resetDelay}, event) => {
      const {data} = event as AugmentPhaseDurationEvent;
      const ratioOfDuration = data / resetDelay;
      const augmentedTime = lastResetTime + phaseAugmentation;
      const timeRemaining = Date.now() - augmentedTime;

      return timeRemaining >= resetDelay;
    },
  },
};

const oscillatingMachine = Machine(config, options);

export {oscillatingMachine};
