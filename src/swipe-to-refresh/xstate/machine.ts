import {of, merge, fromEvent} from 'rxjs';
import {tap, map, take, filter, switchMap, takeUntil} from 'rxjs/operators';
import {assign, Machine} from 'xstate';

const getClientY = (ev: Event): number => {
  const {clientY} = ev as MouseEvent;
  const {changedTouches} = ev as TouchEvent;

  return changedTouches ? changedTouches[0].clientY : clientY;
};

const createMouseMove$ = (el?: HTMLElement) => {
  const mouseup$ = of(window).pipe(
    switchMap(el => merge(fromEvent(el, 'mouseup'), fromEvent(el, 'touchend'))),
    map(() => ({type: 'MOUSE_UP', data: 0} as any)),
  );
  const mousemove$ = of(window).pipe(
    switchMap(() =>
      merge(fromEvent(window, 'mousemove'), fromEvent(window, 'touchmove')).pipe(
        takeUntil(mouseup$),
      ),
    ),
    map(getClientY),
    map(y => ({type: 'MOUSE_MOVE', data: y, to: 'refresh'} as any)),
  );

  return merge(mousemove$, mouseup$);
};

const refreshMachine = Machine(
  {
    id: 'refresh',

    context: {
      yPos: 0,
      el: undefined,
      mouseDownY: 0,
      dragThreshold: 800,
    },

    initial: 'idle',

    states: {
      idle: {
        on: {
          MOUSE_DOWN: {
            target: 'mousedown',
          },
        },

        invoke: {
          id: 'mouse-down-stream',

          src: 'mouseDownStream',
        },
      },

      mousedown: {
        entry: 'updateMouseDownY',

        on: {
          MOUSE_MOVE: 'dragging',
          MOUSE_UP: 'idle',
        },

        invoke: {
          id: 'mouse-move-stream',

          src: 'mouseMoveStream',
        },
      },

      dragging: {
        on: {
          MOUSE_MOVE: [
            {
              cond: 'yIsBelowThreshold',
              actions: 'updateYPos',
            },
            {
              target: 'dragThresholdReached',
            },
          ],
          MOUSE_UP: 'idle',
        },

        invoke: {
          id: 'mouse-move-stream',

          src: 'mouseMoveStream',
        },
      },

      dragThresholdReached: {
        entry: 'handleThresholdReached',

        on: {
          MOUSE_DOWN: 'mousedown',
        },
      },
    },
  },

  {
    actions: {
      updateMouseDownY: assign({mouseDownY: (_, event: any) => event.data}),
      updateYPos: assign({yPos: ({mouseDownY}, event: any) => event.data - mouseDownY}),
      handleThresholdReached: () => {},
    },

    guards: {
      yIsBelowThreshold: ({yPos, dragThreshold}) => {
        return yPos < dragThreshold;
      },
    },

    services: {
      mouseMoveStream: ({el}) => createMouseMove$(el),

      mouseDownStream: ({el}) => {
        return of(el).pipe(
          filter(Boolean),
          take(1),
          switchMap((elem: HTMLElement) =>
            merge(fromEvent(elem, 'mousedown'), fromEvent(elem, 'touchdown')),
          ),
          map(getClientY),
          map(y => ({type: 'MOUSE_DOWN', data: y} as any)),
        );
      },
    },
  },
);

export {refreshMachine};
