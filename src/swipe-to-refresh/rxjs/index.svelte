<script>
  import {onDestroy} from 'svelte';
  import {writable} from 'svelte/store';
  import {combineLatest, of, merge, never} from 'rxjs';
  import {mapTo, takeUntil, take, takeWhile, tap, filter, map, switchMap} from 'rxjs/operators';
  import {createElDragStream} from './streams/index.ts';
  import {spring} from 'svelte/motion';

  const log = tap(console.log.bind(console));
  const mapClientY = map(({clientY, changedTouches}) =>
    changedTouches ? changedTouches[0].clientY : clientY,
  );

  const reloadThreshold = 0.5;
  const evPosScalar = 1 / Math.sqrt(5);
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
  ).pipe(takeWhile(yPos => yPos < window.innerHeight * reloadThreshold));
  $: yPosSub = yPos$.subscribe({
    next(ev) {
      y.set(ev * evPosScalar);
    },
    complete() {
      console.log('reloading');
      window.location.reload();
    },
  });
  $: subs = [mouseupSub, mousedownSub, yPosSub];

  onDestroy(() => {
    subs.map(sub => sub.unsubscribe());
  });
</script>

<style>
  h3 {
    font-family: sans-serif;
  }

  div {
    text-align: center;
  }

  button {
    --y: 0;
    --rotation: 0deg;
    -webkit-appearance: none;
    background-color: skyblue;
    background-image: none;
    border-radius: 50%;
    border: 0;
    color: white;
    font-size: 2em;
    outline: none;
    width: 1.5em;
    height: 1.5em;
    transform: translate3d(0, var(--y), 0) rotateZ(var(--rotation));
    position: relative;
  }

  span {
    position: absolute;
    letter-spacing: 0;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .drag-threshold-indicator {
    --y: 0;
    transform: translateY(calc(var(--y) - 100%));
    text-align: center;
  }
</style>

<h3>Drag down to refresh page</h3>

<div>
  <button bind:this={el} style="--y: {$y}px; --rotation: {$y * 3}deg">
    <span>&orarr;</span>
  </button>
</div>

<div
  class="drag-threshold-indicator"
  style="--y: {window.innerHeight * reloadThreshold * evPosScalar}px">
  drag to here
</div>
