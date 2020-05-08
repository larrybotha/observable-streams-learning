<script>
  import {onDestroy} from 'svelte';
  import {writable} from 'svelte/store';
  import {of, merge, never} from 'rxjs';
  import {mapTo, take, tap, filter, map, switchMap} from 'rxjs/operators';
  import {createElDragStream} from './streams/index.ts';
  import {spring} from 'svelte/motion';

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
  $: mousedownSub = mousedown$.subscribe(({clientY}) => {
    y.damping = 1;
    y.stiffness = 1;
  });
  $: mouseupSub = mouseup$.subscribe(() => {
    y.damping = 0.4;
    y.stiffness = 0.1;
  });
  $: yPos$ = merge(mousemove$.pipe(map(({clientY}) => clientY)), mouseup$.pipe(mapTo(0)));
  $: subs = [mouseupSub, mousedownSub];

  $: {
    y.set($yPos$);
  }

  onDestroy(() => {
    subs.map(sub => sub.unsubscribe());
  });
</script>

<style>
  div {
    --y: 0;
    width: 4em;
    height: 4em;
    transform: translate3d(0, var(--y), 0);
  }
</style>

<div bind:this={el} style="--y: {$y}px">drag</div>
