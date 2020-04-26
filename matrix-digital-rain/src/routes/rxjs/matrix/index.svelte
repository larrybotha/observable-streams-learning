<script>
  import { interpret } from "xstate";
  import Char from "./_components/char.svelte";
  import { charMachine } from "./_machines/char-machine.ts";

  const chars = Array.from({ length: 30 }).map(() => interpret(charMachine));
</script>

<style>
  .canvas {
    background-color: #000;
    height: 100vh;
  }
</style>

<div class="canvas">
  {#each chars as char}
    <Char />
  {/each}
</div>
