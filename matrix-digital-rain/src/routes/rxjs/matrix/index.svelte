<script>
  import { interval } from "rxjs";
  import { scan, take, tap, takeUntil, startWith } from "rxjs/operators";
  import { interpret } from "xstate";
  import Char from "./_components/char.svelte";
  import { createCharMachine } from "./_machines/char-machine.ts";

  const chars$ = interval(100).pipe(
    take(30),
    startWith([]),
    scan(xs => {
      const service = interpret(createCharMachine()).start();

      return xs.concat(service);
    }, [])
  );
</script>

<style>
  .canvas {
    background-color: #000;
    height: 100vh;
  }
</style>

<div class="canvas">
  {#each $chars$ as service (service.sessionId)}
    <Char {service} />
  {/each}
</div>
