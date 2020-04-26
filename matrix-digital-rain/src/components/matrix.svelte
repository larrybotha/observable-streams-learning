<script>
  export let matrix$;
</script>

<style>
  .canvas {
    background-color: #000;
    height: 100vh;
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .line {
    --x: 0px;
    --y: 0px;
    color: green;
    position: absolute;
    transform: translate3d(0, 0, 0);
    transform: translate3d(var(--x), var(--y), 0);
    white-space: pre;
  }
</style>

<div class="canvas">
  {#each $matrix$ as line}
    <div class="line" style="--x: {line.x}px; --y: {line.y}px">
      {line.chars.join('\n')}
    </div>
  {/each}
</div>
