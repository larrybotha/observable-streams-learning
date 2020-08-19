<script>
  import {createEventDispatcher} from 'svelte';
  import {spring, tweened} from 'svelte/motion';
  import {quartIn} from 'svelte/easing';

  import {AnimationState} from './enums';

  export let parsedPath;
  export let state;
  export let expandingConfig = {};
  export let collapsingConfig = {
    damping: 0.2,
    precision: 0.001,
    stiffness: 0.1,
  };

  const expandingOptions = {
    delay: 0,
    duration: 400,
    easing: quartIn,
    ...expandingConfig,
  };
  const collapsingOptions = {
    damping: 0.2,
    precision: 0.001,
    stiffness: 0.1,
    ...collapsingConfig,
  };

  const dispatch = createEventDispatcher();
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

  const collapseStore = spring(originalPath, collapsingOptions);
  const expandStore = tweened(zeroPath, expandingOptions);

  function buildPath(pathMap) {
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
    collapseStore.set(originalPath);
    await expandStore.set(originalPath);

    dispatchExpandEnd();
  }

  async function setCollapsing() {
    expandStore.set(zeroPath);
    await collapseStore.set(zeroPath);

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
  d={buildPath(state === AnimationState.collapsing ? $collapseStore : $expandStore)} />
