import {send, assign, Machine, StateSchema, MachineConfig, MachineOptions} from 'xstate';

interface OscillatorSchema {
  states: {
    resetting: {};
    oscillating: {};
  };
}

interface OscillatorContext {
  timeUntilReset: number;
  initialResetTime: number;
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
    initialResetTime: 2500,
  },

  on: {
    ADD_VALUE: [
      {cond: 'willReset', target: 'resetting', actions: 'clearResetId'},

      {
        actions: ['addToCurrentValue'],
      },
    ],
  },

  states: {
    resetting: {
      entry: ['resetCurrentValue', 'onReset'],

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
    addToCurrentValue: assign({
      timeUntilReset: ({timeUntilReset}, event) => {
        const {data} = event as AddValueEvent;

        return timeUntilReset + data;
      },
    }),

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
