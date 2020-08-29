import {actions, send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    augmentingPhaseDuration: {};
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  progressCallback?: (number) => void;
  resetDelay: number;
  phaseStartTime: number;
  phaseAugmentation: number;
  phaseDuration: number;
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

const getTimeElapsed = ({phaseDuration, phaseStartTime}: OscillatorContext) => {
  const timeElapsed = Date.now() - phaseStartTime;

  console.log(timeElapsed);
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
  phaseAugmentation: 0,
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
      entry: ['augmentPhaseDuration'],

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
          const {phaseStartTime, phaseDuration} = context;
          const timeElapsed = getTimeElapsed(context);

          return Math.max(0, phaseDuration - timeElapsed);
        },
        id: 'queued-reset',
      },
    ),

    augmentPhaseDuration: assign((context, event) => {
      const {phaseDuration} = context;
      const {data: augmentation} = event as AugmentPhaseDurationEvent;
      const elapsedTime = getTimeElapsed(context);
      const scaledAugmentation = augmentation * getAugmentationScalar(context);

      return {
        resetDelay: phaseDuration - (elapsedTime + scaledAugmentation),
      };
    }),

    cancelDelayedReset: cancel('queued-reset'),

    resetPhase: assign(({phaseDuration}) => {
      return {
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

      console.log({willComplete, elapsedTime, scaledAugmentation});
      return willComplete;
    },
  },

  activities: {
    calculateProgress: ({progressCallback, phaseStartTime, phaseAugmentation, resetDelay}) => {
      function doCalc() {
        const durationSinceLastReset = Date.now() - phaseStartTime;
        const durationRemaining = Math.min(resetDelay, durationSinceLastReset + phaseAugmentation);
        const ratioOfDuration = durationRemaining / resetDelay;
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
