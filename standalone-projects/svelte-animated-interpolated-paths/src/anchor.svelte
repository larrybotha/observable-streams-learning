<script>
  export let prevCoords;
  export let coords = [];

  $: baseCoords = prevCoords ? prevCoords.slice(-2).concat(coords.slice(1)) : coords.slice(1);
  $: pairs = baseCoords.reduce(
    (acc, _x, i, xs) => (i % 2 === 0 ? acc.concat([xs.slice(i, i + 2)]) : acc),
    [],
  );
  $: [startAnchor, controlStart, controlEnd, endAnchor] = pairs;
  $: console.log(pairs);
</script>

{#if controlStart}
  <line
    stroke="grey"
    x1={startAnchor[0]}
    y1={startAnchor[1]}
    x2={controlStart[0]}
    y2={controlStart[1]} />
{/if}

{#if endAnchor}
  <line stroke="grey" x1={endAnchor[0]} y1={endAnchor[1]} x2={controlEnd[0]} y2={controlEnd[1]} />
{/if}

{#each pairs.slice(1) as [cx, cy], i}
  <circle
    fill={i === pairs.length - 2 ? 'hotpink' : 'skyblue'}
    r={i === pairs.length - 2 ? 6 : 4}
    {cx}
    {cy} />
{/each}
