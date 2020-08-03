import {send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  timeUntilReset: number;
  initialResetDelay: number;
  lastResetTime: number;
}

type AddValueEvent = {
  type: 'ADD_VALUE';
  data: number;
};

type ResetEvent = {
  type: 'RESET';
};

type OscillatorEvent = AddValueEvent;

const config: MachineConfig<OscillatorContext, OscillatorSchema, OscillatorEvent> = {
  id: 'oscillator',

  initial: 'oscillating',

  context: {
    timeUntilReset: 0,
    initialResetDelay: 2500,
    lastResetTime: performance.now(),
  },

  on: {
    ADD_VALUE: [
      {cond: 'willReset', target: 'resetting', actions: 'clearResetId'},

      {
        actions: [''],
      },
    ],
  },

  states: {
    resetting: {
      entry: ['setResetTime', 'onReset'],

      on: {
        '': {
          target: 'oscillating',
        },
      },
    },

    oscillating: {
      entry: 'queueReset',
    },
  },
};

const options: Partial<MachineOptions<OscillatorContext, OscillatorEvent>> = {
  actions: {
    setResetTime: assign({lastResetTime: performance.now()}),

    resetCurrentValue: assign({timeUntilReset: 0}),

    onReset: () => {},
  },

  guards: {
    willReset: ({timeUntilReset}, event) => {
      const {data} = event;

      return timeUntilReset + data >= 1;
    },
  },
};

const oscillatingMachine = Machine(config, options);

export {oscillatingMachine};
