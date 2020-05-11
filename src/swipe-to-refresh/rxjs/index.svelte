<script>
  import {onDestroy} from 'svelte';
  import {spring} from 'svelte/motion';
  import {writable} from 'svelte/store';
  import {combineLatest, of, merge, never} from 'rxjs';
  import {mapTo, takeUntil, take, takeWhile, tap, filter, map, switchMap} from 'rxjs/operators';

  import {createElDragStream} from './streams/index.ts';

  import Refresh from '../components/refresh.svelte';

  const mapClientY = map(({clientY, changedTouches}) =>
    changedTouches ? changedTouches[0].clientY : clientY,
  );

  const reloadScalar = 0.5;
  const reloadHeight = window.innerHeight * reloadScalar;
  const yScalar = 1 / Math.sqrt(5);
  let el;
  let elStore = writable(null);
  let y = spring(0);
  /**
   * reactively set the store when we get an element
   */
  $: elStore.set(el);
  /**
   * take the first non-null value from the reactive store
   */
  $: elDrag$ = of($elStore).pipe(
    filter(Boolean),
    take(1),
    switchMap(elem => createElDragStream(elem)),
  );
  $: mousemove$ = elDrag$.pipe(filter(({type}) => /(move)/.test(type)));
  $: mousedown$ = elDrag$.pipe(filter(({type}) => /(mousedown|touchstart)/.test(type)));
  $: mouseup$ = elDrag$.pipe(filter(({type}) => /(mouseup|touchend)/.test(type)));

  $: mousedownSub = mousedown$.subscribe(() => {
    y.damping = 1;
    y.stiffness = 1;
  });

  $: mouseupSub = mouseup$.subscribe(() => {
    y.damping = 0.4;
    y.stiffness = 0.1;
  });

  $: yPos$ = merge(
    // prevent yPos$ from completing when the component is first rendered
    never(),
    combineLatest(mousedown$.pipe(mapClientY), mousemove$.pipe(mapClientY)).pipe(
      map(([downY, moveY]) => moveY - downY),
      takeUntil(mouseup$),
    ),
    mouseup$.pipe(mapTo(0)),
  ).pipe(takeWhile(yPos => yPos < reloadHeight));
  $: yPosSub = yPos$.subscribe({
    next(ev) {
      y.set(ev * yScalar);
    },
    complete() {
      window.location.reload();
    },
  });
  $: subs = [mouseupSub, mousedownSub, yPosSub];

  onDestroy(() => {
    subs.map(sub => sub.unsubscribe());
  });
</script>

<Refresh bind:el y={$y} {reloadHeight} {yScalar} />
