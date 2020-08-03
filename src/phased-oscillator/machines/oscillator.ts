import {actions, send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    augmentingPhaseDuration: {};
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  timeUntilReset: number;
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
    timeUntilReset: 0,
    resetDelay: 2500,
    lastResetTime: performance.now(),
    phaseAugmentation: 0,
  },

  on: {
    AUGMENT_PHASE_DURATION: [
      {cond: 'willCompletePhase', target: 'resetting', actions: ['cancelDelayedReset', 'reset']},

      {
        actions: ['augmentPhaseDuration'],
        target: 'augmentingPhaseDuration',
      },
    ],
  },

  states: {
    augmentingPhaseDuration: {
      entry: ['cancelDelayedReset'],

      on: {
        '': 'oscillating',
      },
    },

    resetting: {
      entry: ['resetPhase', 'cancelDelayedReset', 'onReset'],

      on: {
        '': 'oscillating',
      },
    },

    oscillating: {
      entry: 'queueReset',
    },
  },
};

const options: Partial<MachineOptions<OscillatorContext, OscillatorEvent>> = {
  actions: {
    queueReset: send(
      {type: 'RESET'},
      {
        delay: ({lastResetTime, resetDelay, phaseAugmentation}) =>
          resetDelay - performance.now() - (lastResetTime + phaseAugmentation),
        id: 'queued-reset',
      },
    ),

    augmentPhaseDuration: assign(({phaseAugmentation, resetDelay, lastResetTime}, event) => {
      const {data: augmentation} = event as AugmentPhaseDurationEvent;
      const ratioOfDuration = augmentation / resetDelay;
      const radiansToAdd = (Math.PI / 2) * ratioOfDuration;
      const currentRadians =
        ((Math.PI / 2) * (performance.now() - (lastResetTime + phaseAugmentation))) / resetDelay;
      const newAugmentation = resetDelay - Math.sin(currentRadians + radiansToAdd) * resetDelay;

      return {
        phaseAugmentation: newAugmentation,
      };
    }),

    cancelDelayedReset: cancel('queued-reset'),

    resetPhase: assign({
      lastResetTime: performance.now(),
      phaseAugmentation: 0,
    }),

    onReset: () => {},
  },

  guards: {
    willCompletePhase: ({phaseAugmentation, lastResetTime, resetDelay}, event) => {
      const {data} = event as AugmentPhaseDurationEvent;

      return performance.now() - (lastResetTime + phaseAugmentation) >= resetDelay;
    },
  },
};

const oscillatingMachine = Machine(config, options);

export {oscillatingMachine};
