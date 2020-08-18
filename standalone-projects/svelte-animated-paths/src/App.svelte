<script>
  import {spring} from 'svelte/motion';
  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  const el = document.querySelector('svg');
  const paths = el.querySelectorAll('path');

  const parsedPaths = [...paths].map((path) => {
    const result = normalizeSvgPath(absSvgPath(parseSvgPath(path.getAttribute('d'))));

    return result;
  });

  const firstPath = parsedPaths[6];
  const parsedPath = firstPath.reduce((acc, [command, ...xs], i) => {
    return {...acc, [`${command}${i}`]: xs};
  }, {});
  const zeroPath = firstPath.reduce((acc, [command, ...xs], i) => {
    return {
      ...acc,
      [`${command}${i}`]: /m/i.test(command)
        ? xs
        : xs.map((coord, i) => (i % 2 === 0 ? coord : firstPath[0][2])),
    };
  }, {});

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

  function pathToString(path) {
    return Object.entries(path).reduce((acc, [k, xs]) => {
      const result = `${acc}${k.replace(/\d+/, '')}${xs.join(',')}`;

      return result;
    }, '');
  }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1024 267"
  x="0px"
  y="0px"
  xml:space="preserve"
  style="enable-background:new 0 0 1024 267;">
  <path
    style="fill:none;stroke:#DB3552;stroke-width:0.4099;stroke-linejoin:round;"
    d={pathToString($s)} />
</svg>

<label>
  <input type="checkbox" bind:checked={visible} />
  toggle me
</label>
