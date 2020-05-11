<script>
  import {spring} from 'svelte/motion';

  export let el;
  export let y;
  export let reloadHeight;
  export let yScalar;
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
  <button bind:this={el} style="--y: {y}px; --rotation: {y * 3}deg">
    <span>&orarr;</span>
  </button>
</div>

<div class="drag-threshold-indicator" style="--y: {reloadHeight * yScalar}px">drag to here</div>
