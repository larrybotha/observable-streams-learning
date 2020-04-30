<script>
  import { never } from "rxjs";
  import { tap, filter, map, distinctUntilChanged } from "rxjs/operators";
  import { createStream } from "./streams/index.ts";
  import { spring } from "svelte/motion";

  let el;
  let y = spring(0);
  let drag$ = never();

  $: if (el) {
    drag$ = createStream(el);
  }
  $: console.log($drag$);

  const mousedown$ = drag$.pipe(filter(ev => ev.type === "mousedown"));

  const mousedrag$ = drag$.pipe(
    tap(console.log.bind(console)),
    filter(ev => ev.type === "mousemove"),
    map(ev => event.clientY),
    distinctUntilChanged()
  );

  const mouseup$ = drag$.pipe(filter(ev => ev.type === "mouseup"));

  mousedown$.subscribe(() => {
    y.damping = 0;
    y.stiffness = 0;
  });

  mousedrag$.subscribe(clientY => {
    y.set(clientY);
  });

  mouseup$.subscribe(() => {
    y.damping = 0.4;
    y.stiffness = 0.1;
    y.set(0);
  });
</script>

<style>
  div {
    --y: 0;
    width: 4em;
    height: 4em;
    transform: translate(0, var(--y), 0);
  }
</style>

<div bind:this={el} style="--y: {$y}px">drag</div>
