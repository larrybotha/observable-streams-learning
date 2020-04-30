<script>
  import { interpret } from "xstate";
  import { from } from "rxjs";

  import { createCharMachine } from "../machines/char-machine.ts";

  export let service;
  let char$ = from(service);
</script>

<style>
  .char {
    --color: "inherit";
    --opacity: 1;
    color: var(--color);
    opacity: var(--opacity);
    transition: all 0.3s linear;
  }
</style>

<div
  class="char"
  style="--opacity: {$char$.context.opacity}; --color: {$char$.context.color}">
  {$char$.context.char}
</div>
