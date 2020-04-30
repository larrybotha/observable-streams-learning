import {fromEvent, merge} from 'rxjs';
import {switchMap, takeUntil, repeat} from 'rxjs/operators';

const createStream = (el: HTMLElement) => {
  const mouseDown$ = merge(fromEvent(el, 'mousedown'), fromEvent(el, 'touchstart'));
  const mouseUp$ = merge(fromEvent(el, 'mouseup'), fromEvent(el, 'touchend'));
  const mouseMove$ = merge(fromEvent(document, 'mousemove'), fromEvent(document, 'touchmove'));

  const drag$ = mouseDown$.pipe(
    switchMap(() => mouseMove$),
    takeUntil(mouseUp$),
    repeat(),
  );

  return drag$;
};

export {createStream};
