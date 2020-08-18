<script>
  import {spring} from 'svelte/motion';
  import {createEventDispatcher} from 'svelte';

  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  import {AnimationState} from './enums';

  export let rawPath;
  export let state;
  export let expandingConfig = {
    damping: 0.8,
    stiffness: 0.3,
    precision: 0.001,
  };
  export let collapsingConfig = {
    damping: 0.2,
    stiffness: 0.2,
    precision: 0.001,
  };

  const dispatch = createEventDispatcher();
  const parsedPath = normalizeSvgPath(absSvgPath(parseSvgPath(rawPath)));
  const originalPath = parsedPath.reduce((acc, [command, ...xs], i) => {
    return {...acc, [`${command}${i}`]: xs};
  }, {});
  const originY = parsedPath[0][2];
  const zeroPath = parsedPath.reduce((acc, [command, ...xs], i) => {
    return {
      ...acc,
      [`${command}${i}`]: /m/i.test(command)
        ? xs
        : xs.map((coord, i) => (i % 2 === 0 ? coord : originY)),
    };
  }, {});

  const pathStore = spring(zeroPath);

  function pathToString(pathMap) {
    return Object.keys(pathMap).reduce((acc, key) => {
      const coords = pathMap[key];
      const command = key.replace(/\d+/, '');
      const coordString = coords.join(',');
      const result = `${acc}${command}${coordString}`;

      return result;
    }, '');
  }

  $: if (state === AnimationState.expanding) {
    setExpanding();
  }

  $: if (state === AnimationState.collapsing) {
    setCollapsing();
  }

  async function setExpanding() {
    const {damping, stiffness, precision} = expandingConfig;

    pathStore.damping = damping;
    pathStore.stiffness = stiffness;
    pathStore.precision = precision;

    await pathStore.set(originalPath);

    dispatchExpandEnd();
  }

  async function setCollapsing() {
    const {damping, stiffness, precision} = collapsingConfig;

    pathStore.damping = damping;
    pathStore.stiffness = stiffness;
    pathStore.precision = precision;

    await pathStore.set(zeroPath);

    dispatchCollapseEnd();
  }

  function dispatchCollapseEnd() {
    dispatch('collapseend');
  }

  function dispatchExpandEnd() {
    dispatch('expandend');
  }
</script>

<path
  style="fill:none;stroke:#DB3552;stroke-width:0.4099;stroke-linejoin:round;"
  d={pathToString($pathStore)} />
