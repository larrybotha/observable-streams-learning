<script>
  import { interpret } from "xstate";
  import { from } from "rxjs";

  export let service;
  const char$ = from(service.start());
</script>

<style>
  .char {
    --color: "inherit";
    --opacity: 1;
    color: var(--color);
    opacity: var(--opacity);
    font-size: 3rem;
    transition: all 0.3s linear;
  }
</style>

<div class="canvas">
  <div
    class="char"
    style="--opacity: {$char$.context.opacity}; --color: {$char$.context.color}">
    {$char$.context.char}
  </div>
</div>
