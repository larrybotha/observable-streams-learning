import {
  Interpreter,
  Machine,
  MachineConfig,
  MachineOptions,
  StateSchema,
  assign,
  sendParent,
  spawn,
} from 'xstate';

import {
  AugmentPhaseDurationEvent,
  OscillatorService,
  oscillatingMachine,
  defaultContext as oscillatorDefaultContext,
} from './oscillator';

interface OscillatorsSchema extends StateSchema {
  states: {
    active: {};
  };
}

interface OscillatorsContext {
  oscillators: OscillatorService[];
}

type AddOscillatorEvent = {
  type: 'ADD_OSCILLATOR';
};

type OscillatorPhaseCompleteEvent = {
  type: 'OSCILLATOR_PHASE_COMPLETE';
  data: {id: number | string; phaseDuration: number};
};

type OscillatorsEvent =
  | AddOscillatorEvent
  | OscillatorPhaseCompleteEvent
  | AugmentPhaseDurationEvent;

export type OscillatorsService = Interpreter<
  OscillatorsContext,
  OscillatorsSchema,
  OscillatorsEvent
>;

const defaultContext: OscillatorsContext = {
  oscillators: [],
};

const config: MachineConfig<OscillatorsContext, OscillatorsSchema, OscillatorsEvent> = {
  id: 'oscillators',

  initial: 'active',

  context: {...defaultContext},

  on: {
    ADD_OSCILLATOR: {actions: ['addOscillator']},
    OSCILLATOR_PHASE_COMPLETE: {actions: ['augmentOscillators']},
  },

  states: {
    active: {},
  },
};

const options: Partial<MachineOptions<OscillatorsContext, OscillatorsEvent>> = {
  actions: {
    addOscillator: assign<OscillatorsContext>({
      oscillators: (context) => {
        const {oscillators} = context;
        const id = `${Date.now()}`;
        const oscillator: any = spawn(
          oscillatingMachine.withContext({...oscillatorDefaultContext}).withConfig({
            actions: {
              onPhaseComplete: sendParent({
                type: 'OSCILLATOR_PHASE_COMPLETE',
                data: {
                  id,
                  phaseDuration: oscillatorDefaultContext.phaseDuration,
                },
              }),
            },
          }),
          id,
        );

        return oscillators.concat(oscillator);
      },
    }),

    augmentOscillators: ({oscillators}, event) => {
      const {data} = event as OscillatorPhaseCompleteEvent;
      const {id, phaseDuration} = data;

      oscillators
        .filter((oscillator) => oscillator.id !== id)
        .map((ref) =>
          ref.send('AUGMENT_PHASE_DURATION', {data: phaseDuration / oscillators.length}),
        );
    },
  },
};

const oscillatorsMachine = Machine(config, options);

export {oscillatorsMachine, defaultContext};
