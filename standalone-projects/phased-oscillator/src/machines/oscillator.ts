import {actions, send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    augmentingPhaseDuration: {};
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  augmentations: number[];
  phaseDuration: number;
  phaseStartTime: number;
  progressCallback?: (x: number) => void;
  resetDelay: number;
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

const getTimeElapsed = ({augmentations, phaseStartTime}: OscillatorContext) => {
  const augmentedTime = augmentations.reduce((acc, x) => acc + x, 0);
  const timeElapsed = augmentedTime + Date.now() - phaseStartTime;

  return timeElapsed;
};

const getAugmentationScalar = (context: OscillatorContext) => {
  const {phaseDuration} = context;
  /**
   * The upper bound of our oscillator for sin(Ø)
   *
   * i.e. sin(90) = 1
   */
  const rangeCeiling = Math.PI / 2;
  const rangeFn = Math.sin;
  const elapsedTime = getTimeElapsed(context);
  /**
   * for a sin graph [0, PI / 2]:
   * - the more time that has passed, the closer to PI / 2 we are
   * - if time passed exceeds the phase duration, then the oscillator should reset
   */
  const elapsedRadians = rangeCeiling * Math.min(1, elapsedTime / phaseDuration);
  /**
   * Get the corresponding y value at sin(Ø)
   */
  const y = rangeFn(elapsedRadians);
  /**
   * sin(Ø) has domain [0, 1]
   *
   * - get the remaining y value the oscillator will traverse before resetting
   */
  const scalar = rangeFn(rangeCeiling) - y;

  return scalar;
};

const defaultContext = {
  phaseDuration: 5000,
  resetDelay: 0,
  phaseStartTime: Date.now(),
  augmentations: [],
};

const config: MachineConfig<OscillatorContext, OscillatorSchema, OscillatorEvent> = {
  id: 'oscillator',

  initial: 'oscillating',

  context: {...defaultContext},

  on: {
    AUGMENT_PHASE_DURATION: [
      {cond: 'willCompletePhase', target: 'resetting'},
      {target: 'augmentingPhaseDuration'},
    ],
  },

  states: {
    augmentingPhaseDuration: {
      entry: ['updateResetDelay', () => console.log('updating reset delay')],

      always: 'oscillating',
    },

    resetting: {
      entry: ['resetPhase', 'onReset', () => console.log('resetting')],

      always: 'oscillating',
    },

    oscillating: {
      activities: ['calculateProgress'],
      entry: ['queueReset', () => console.log('queuing reset')],
      exit: ['cancelDelayedReset', () => console.log('cancelling delay')],

      on: {RESET: 'resetting'},
    },
  },
};

const options: Partial<MachineOptions<OscillatorContext, OscillatorEvent>> = {
  actions: {
    queueReset: send(
      {type: 'RESET'},
      {
        delay: (context) => {
          const {resetDelay} = context;

          return resetDelay;
        },
        id: 'queued-reset',
      },
    ),

    updateResetDelay: assign((context, event) => {
      const {augmentations, phaseDuration} = context;
      const {data: augmentation} = event as AugmentPhaseDurationEvent;
      const elapsedTime = getTimeElapsed(context);
      const scaledAugmentation = augmentation * getAugmentationScalar(context);
      const resetDelay = phaseDuration - (elapsedTime + scaledAugmentation);

      return {
        augmentations: augmentations.concat(scaledAugmentation),
        resetDelay,
      };
    }),

    cancelDelayedReset: cancel('queued-reset'),

    resetPhase: assign(({phaseDuration}) => {
      return {
        augmentations: [],
        phaseStartTime: Date.now(),
        resetDelay: phaseDuration,
      };
    }),

    onReset: () => {},
  },

  guards: {
    willCompletePhase: (context, event) => {
      const {phaseDuration} = context;
      const {data: augmentation} = event as AugmentPhaseDurationEvent;
      const elapsedTime = getTimeElapsed(context);
      const scaledAugmentation = augmentation * getAugmentationScalar(context);
      /**
       * If elapsed time plus scaled augmentation is greater than phaseDuration,
       * then oscillator will complete
       */
      const willComplete = scaledAugmentation + elapsedTime >= phaseDuration;

      return willComplete;
    },
  },

  activities: {
    calculateProgress: (context) => {
      const {progressCallback, phaseDuration} = context;

      function doCalc() {
        const elapsedTime = getTimeElapsed(context);
        const ratioOfDuration = elapsedTime / phaseDuration;
        const y = Math.sin((Math.PI / 2) * ratioOfDuration);

        if (progressCallback) {
          progressCallback(y);
          requestAnimationFrame(doCalc);
        }
      }

      if (typeof progressCallback === 'function') {
        requestAnimationFrame(doCalc);
      }
    },
  },
};

const oscillatingMachine = Machine(config, options);

export {oscillatingMachine, defaultContext};
