import {of, fromEvent, merge, combineLatest} from 'rxjs';
import {tap, take, filter, switchMap, takeUntil, repeat, shareReplay} from 'rxjs/operators';

const createElDragStream = (el: HTMLElement) => {
  const el$ = of(el).pipe(filter<HTMLElement>(Boolean));
  const mouseDown$ = merge(
    el$.pipe(switchMap(node => fromEvent(node, 'mousedown'))),
    el$.pipe(switchMap(node => fromEvent(node, 'touchstart'))),
  );
  const mouseUp$ = merge(fromEvent(document, 'mouseup'), fromEvent(document, 'touchend'));
  const mouseMove$ = merge(fromEvent(document, 'mousemove'), fromEvent(document, 'touchmove'));
  const moveEl$ = mouseDown$.pipe(
    switchMap(() => merge(mouseMove$.pipe(takeUntil(mouseUp$)), mouseUp$.pipe(take(1)))),
  );

  const drag$ = merge(mouseDown$, moveEl$);

  return drag$;
};

export {createElDragStream};
