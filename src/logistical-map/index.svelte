<script>
  import {spring} from 'svelte/motion';
  import {interpret} from 'xstate';

  import {logisticalMap} from './utils';

  let startX = 0.1;
  let r = 2;
  let numValues = 10;

  $: xs = Array.from({length: numValues}).reduce(
    (acc) => {
      return [...acc, logisticalMap(r, acc.slice(-1).find(Boolean))];
    },
    [logisticalMap(r, startX)],
  );
</script>

<div>
  {r}
  <br />
  <input type="range" step=".1" max="2" min="0" bind:value={r} />
</div>

<div>
  {startX}
  <br />
  <input type="range" step=".1" max="2" min="0" bind:value={startX} />
</div>

<div>
  {numValues}
  <br />
  <input type="range" step="1" max="20" min="1" bind:value={numValues} />
</div>
{xs.join(', ')}
