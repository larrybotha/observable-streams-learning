<script>
  import * as Pancake from '@sveltejs/pancake';

  import {logisticalMap} from './utils';

  let startX = 0.1;
  let r = 3;
  let numValues = 100;
  let closest;

  $: xs = Array.from({length: numValues})
    .map((_, i) => i + 1)
    .reduce(
      (acc, n) => {
        const y = logisticalMap(r, acc.slice(-1).find(Boolean).y);

        return [...acc, {x: n, y}];
      },
      [{x: 0, y: logisticalMap(r, startX)}],
    );

  $: xs2 = Array.from({length: numValues})
    .map((_, i) => i + 1)
    .reduce(
      (acc, n) => {
        const y = logisticalMap(r, acc.slice(-1).find(Boolean).y);
        const resultY = !isFinite(y) ? 1 * (y > 0 ? 1 : -1) : y;

        return [...acc, {x: n, y: resultY}];
      },
      [{x: 0, y: logisticalMap(r, startX + 0.00000001)}],
    );

  let x1 = +Infinity;
  let x2 = -Infinity;
  let y1 = 0;
  let y2 = 1;

  $: {
    numValues;
    x1 = +Infinity;
    x2 = -Infinity;

    xs.forEach((d) => {
      if (d.x < x1) x1 = d.x;
      if (d.x > x2) x2 = d.x;
    });
  }
</script>

<style>
  .chart {
    height: 400px;
    padding: 3em 0 2em 2em;
    margin: 0 0 36px 0;
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

  path.data {
    stroke: rgba(0, 0, 0, 0.2);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2px;
    fill: none;
  }

  path.data.additional {
    stroke: red;
  }
</style>

<div>
  R: {r}
  <br />
  <input type="range" step=".025" max="4" min="2" bind:value={r} />
</div>

<div>
  x: {startX}
  <br />
  <input type="range" step=".05" max="1" min="0" bind:value={startX} />
</div>

<div>
  num observations: {numValues}
  <br />
  <input type="range" step="1" max="200" min="1" bind:value={numValues} />
</div>

<div class="chart">
  <Pancake.Chart {x1} {x2} {y1} {y2}>
    <Pancake.Grid horizontal count={5} let:value>
      <div class="grid-line horizontal">
        <span>{value}</span>
      </div>
    </Pancake.Grid>

    <Pancake.Grid vertical count={5} let:value>
      <div class="grid-line vertical">
        <span>{value}</span>
      </div>
    </Pancake.Grid>

    <Pancake.Svg>
      <Pancake.SvgLine data={xs} let:d>
        <path class="data" {d} />
      </Pancake.SvgLine>

      <Pancake.SvgLine data={xs2} let:d>
        <path class="data additional" {d} />
      </Pancake.SvgLine>
    </Pancake.Svg>

    <Pancake.Quadtree data={xs} bind:closest />
  </Pancake.Chart>
</div>
