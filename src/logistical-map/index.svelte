<script>
  import {spring} from 'svelte/motion';
  import {interpret} from 'xstate';
  import * as Pancake from '@sveltejs/pancake';

  import {logisticalMap} from './utils';

  let startX = 0.1;
  let r = 2;
  let numValues = 10;

  $: xs = Array.from({length: numValues})
    .map((_, i) => i + 1)
    .reduce(
      (acc, n) => {
        return [...acc, {x: n, y: logisticalMap(r, acc.slice(-1).find(Boolean))}];
      },
      [{x: 0, y: logisticalMap(r, startX)}],
    );

  let x1 = +Infinity;
  let x2 = -Infinity;
  let y1 = +Infinity;
  let y2 = -Infinity;
</script>

<style>
  .chart {
    height: 400px;
    padding: 3em 0 2em 2em;
    margin: 0 0 36px 0;
  }
  input {
    font-size: inherit;
    font-family: inherit;
    padding: 0.5em;
  }
  .grid-line {
    position: relative;
    display: block;
  }
  .grid-line.horizontal {
    width: calc(100% + 2em);
    left: -2em;
    border-bottom: 1px dashed #ccc;
  }
  .grid-line span {
    position: absolute;
    left: 0;
    bottom: 2px;
    font-family: sans-serif;
    font-size: 14px;
    color: #999;
  }
  .x-label {
    position: absolute;
    width: 4em;
    left: -2em;
    bottom: -22px;
    font-family: sans-serif;
    font-size: 14px;
    color: #999;
    text-align: center;
  }
  path.data {
    stroke: rgba(0, 0, 0, 0.2);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1px;
    fill: none;
  }
  .highlight {
    stroke: #ff3e00;
    fill: none;
    stroke-width: 2;
  }
  .annotation {
    position: absolute;
    white-space: nowrap;
    bottom: 1em;
    line-height: 1.2;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 0.2em 0.4em;
    border-radius: 2px;
  }
  .annotation-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #ff3e00;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .annotation strong {
    display: block;
    font-size: 20px;
  }
  .annotation span {
    display: block;
    font-size: 14px;
  }
</style>

<div>
  {r}
  <br />
  <input type="range" step=".05" max="4" min="2" bind:value={r} />
</div>

<div>
  {startX}
  <br />
  <input type="range" step=".1" max="2" min="0" bind:value={startX} />
</div>

<div>
  {numValues}
  <br />
  <input type="range" step="1" max="50" min="1" bind:value={numValues} />
</div>

<Pancake.Chart {x1} {x2} {y1} {y2}>
  <Pancake.Grid horizontal count={5} let:value>
    <div class="grid-line horizontal">
      <span>{value}</span>
    </div>
  </Pancake.Grid>

  <Pancake.Grid vertical count={5} let:value />

  <Pancake.Svg>
    <Pancake.SvgLine data={xs} let:d>
      <path class="data" {d} />
    </Pancake.SvgLine>
  </Pancake.Svg>

  <Pancake.Quadtree data={xs} />
</Pancake.Chart>
