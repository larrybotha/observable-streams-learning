<script>
  export let coords = [];

  $: pairs = coords
    .slice(1)
    .reduce((acc, _x, i, xs) => (i % 2 === 0 ? acc.concat([xs.slice(i, i + 2)]) : acc), []);
  $: [[cx, cy]] = pairs.slice(-1);
  $: d = pairs.map((pair) => pair.join(' ')).join('L ');
</script>

<g>
  {#each pairs as [cx, cy], i}
    <circle
      fill={i === pairs.length - 1 ? 'hotpink' : 'skyblue'}
      r={i === pairs.length - 1 ? 6 : 4}
      {cx}
      {cy} />
  {/each}

  {#each pairs.slice(0, -1) as [x1, y1]}
    <line stroke="white" {x1} {y1} x2={cx} y2={cy} />
  {/each}
</g>
