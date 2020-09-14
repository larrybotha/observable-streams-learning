<script>
  import {onMount} from 'svelte';
  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  import {buildPath} from './utils';

  import Anchor from './anchor.svelte';

  export let svgAttributes;
  let paths = [];

  $: console.log(paths);

  onMount(() => {
    const pathEls = Array.from(document.querySelectorAll('path'));

    paths = pathEls.map((pathEl) => {
      const d = pathEl.getAttribute('d');

      return normalizeSvgPath(absSvgPath(parseSvgPath(d)));
    });
  });
</script>

<svg {...svgAttributes}>
  {#each paths as path}
    {#each path as coords, i}
      <Anchor {coords} prevCoords={i > 0 ? path[i - 1] : undefined} />
    {/each}

    <path d={buildPath(path)} />
  {/each}

  <path
    style="display: none;"
    d="M0 381.9c201.5 0 347.5.2 359.3-2.6 84.8-21.3 114.9-166.7 159.1-191.5 7.9-4.1 15.8-4.6 27.6 5
    24.1 20.2 46.1 66.6 70.1 76.4 14.8 5.6 27.7-2.5 38.9-14 54-56.2 87.6-213.6 131-137.4 26.7 47.3
    51.3 154.4 77.9 174.1 28.7 19.5 54.9-57.2 83.8-33.1 24.7 21.5 47.7 102.1 72.5 113.6 5.5 2.2
    9.4.8 13.9-2.9 22.7-19.7 43.7-98.8 66.8-140.1 7.3-12.8 16.4-25.5 30.7-22.9 11.9 2.7 22.6 15.1 31
    25.6 21.6 27.5 34 52.2 68.8 76.9 17.6 12.4 30.5 18.2 62.7 36 81.1 44.5 87 35.3 197 34.4 19.8-.2
    42.5-.4 67.5-.6H1920" />
  <path
    style="display: none;"
    d="M0 375c40.1-.5 76.8-1.2 126.8-2.3 269.9-5.9 252.7-6.9 308.9-10.1 147.5-8.4 160.5-9.6 221.7-23
    30.6-6.7 60-14.7 102.6-30 15.1-5.4 47.1-17.4 61.4-24.7 18.5-9.4 33.8-20.9 51.9-29.2 23.3-10.6
    35.6-10.1 49.3-7.3 12.7 2.6 25.1 7.2 38.4 7.2 21.9 0 36.4-12.7 51-28.7 39.5-43.4 62.8-85.9
    87.8-80.2 18.9 4.3 44.5 40.6 55.1 56.9 24.2 37 19.2 35.6 52.2 78.3 22.3 28.7 28.7 42.7 62 65.5
    16.3 11.2 27.3 17.8 41.8 22.6 28 9.2 59.8 8 91 8 111.2 0 98.5 1 122.2.1 49.5-2 82.9-9.6
    121.1-8.9 46.4.9 64.3 7.9 120.3 9.2 30.3.7 44.9-.4 107.3-.9h47.2" />
  <path
    style="display: none;"
    d="M0 374c222-.1 588.5-.2 610.1.1 101.9 1.6 160.7 21.4 263.4 22.4 98 1 120.1-10.1 255.5-2.3 50.7
    2.9 61.5 2.5 112.4 2 34-.4 64.1.1 91.4-2.5 48.6-4.7 69.5-16 129.3-13.1 42.6 2.1 50 3.3 92.9-2.7
    39.3-5.5 52.4-8.8 109.5-6.9 44.4 1.2 22.1 1.2 255.5 1.1" />
</svg>
