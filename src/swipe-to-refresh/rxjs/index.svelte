<script>
  import {never} from 'rxjs';
  import {tap, filter, map, distinctUntilChanged} from 'rxjs/operators';
  import {createElDragStream} from './streams/index.ts';
  import {spring} from 'svelte/motion';

  let el;
  let y = spring(0);
  let elDrag$ = never();
  let mousedown$ = never();
  let mouseup$ = never();
  let yPos$ = never();

  $: if (el) {
    elDrag$ = createElDragStream(el);
  }
  $: if (el) {
    mousedown$ = elDrag$.pipe(filter(({type}) => /(start|down)/.test(type)));
    mouseup$ = elDrag$.pipe(filter(({type}) => /(up|end)/.test(type)));
    yPos$ = elDrag$.pipe(
      filter(({type}) => /move/.test(type)),
      map(({clientY}) => clientY),
    );
    console.log('ere');

    mousedown$.subscribe(() => {
      console.log('sdf');
      y.damping = 0;
      y.stiffness = 0;
    });
    yPos$.subscribe(yPos => y.set(yPos));
    mouseup$.subscribe(() => {
      y.damping = 0.4;
      y.stiffness = 0.1;
      y.set(0);
    });
  }
</script>

<style>
  div {
    --y: 0;
    width: 4em;
    height: 4em;
    transform: translate(0, var(--y), 0);
  }
</style>

{$y}
<div bind:this={el} style="--y: {$y}px">drag</div>
