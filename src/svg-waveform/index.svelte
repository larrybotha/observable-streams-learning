<script>
  import SVG from './waveform.svg';

  import {quintOut} from 'svelte/easing';
  import {fade, draw, fly} from 'svelte/transition';
  import {spring} from 'svelte/motion';

  let svgEl;
  $: console.log(svgEl);
  let path = `
  M 213.1,6.7
  c -32.4-14.4-73.7,0-88.1,30.6
  C 110.6,4.9,67.5-9.5,36.9,6.7
  C 2.8,22.9-13.4,62.4,13.5,110.9
  C 33.3,145.1,67.5,170.3,125,217
  c 59.3-46.7,93.5-71.9,111.5-106.1
  C 263.4,64.2,247.2,22.9,213.1,6.7
	`;
  /**/
  path = `
		M 10,90
		C 30,90 25,10 50,10
		S 70,90 90,90
`; /**/

  const parsedPath = path
    .split(/(\w{1,2}[.-\s\d*,]*)/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      return s
        .split(/(\w+)(.*)/g)
        .map((s) => s.trim())
        .filter(Boolean);
    })
    .reduce((acc, [c, ds = '']) => {
      return {
        ...acc,
        [c]: ds
          .trim()
          .split(' ')
          .map((ds) => {
            return ds.split(/,/).map((d) => parseInt(d, 10));
          }),
      };
    }, {});
  const zeroPath = Object.entries(parsedPath).reduce((acc, [k, xxs]) => {
    return {
      ...acc,
      [k]: xxs.map((xs) => xs.map((x, i) => (i === 0 ? x : 90))),
    };
  }, {});

  function pathToString(path) {
    return Object.entries(path).reduce((acc, [k, xxs]) => {
      return `${acc} ${k} ${xxs.map((xs) => xs.join(',')).join(' ')}`;
    }, '');
  }

  const s = spring(zeroPath);
  s.damping = 0.3;
  s.stiffness = 0.1;
  let visible = true;

  $: if (visible) {
    s.set(parsedPath);
  }

  $: if (!visible) {
    s.set(zeroPath);
  }
</script>

<SVG bind:this={svgEl} />
