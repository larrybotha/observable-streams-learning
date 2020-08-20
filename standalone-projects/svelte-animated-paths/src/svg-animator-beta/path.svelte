<script>
  import {createEventDispatcher} from 'svelte';
  import {spring, tweened} from 'svelte/motion';
  import {quartIn, quintOut} from 'svelte/easing';

  import {AnimationState, PathState} from './enums';

  export let parsedPath;
  export let state;
  export let expandingConfig = {};
  export let collapsingConfig = {};

  let pathState = PathState.atRest;

  const expandingOptions = {
    delay: 0,
    duration: 500,
    easing: quartIn,
    ...expandingConfig,
  };

  const collapsingOptions = {
    damping: 0.4,
    precision: 0.01,
    stiffness: 0.2,
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

  const expandStore = tweened(zeroPath, expandingOptions);
  /*const collapseStore = spring(originalPath, collapsingOptions);*/
  const collapseStore = tweened(originalPath, {
    ...expandingOptions,
    easing: quintOut,
  });

  $: if (state === AnimationState.animating && pathState === PathState.atRest) {
    transitionToExpanding();
  }

  $: if (pathState === PathState.expanding) {
    expandPath();
  }

  $: if (pathState === PathState.collapsing) {
    collapsePath();
  }

  $: if (pathState === PathState.complete) {
    dispatchComplete();
  }

  function transitionToExpanding() {
    pathState = PathState.expanding;
  }

  function transitionToCollapsing() {
    pathState = PathState.collapsing;
  }

  function transitionToComplete() {
    pathState = PathState.complete;
  }

  async function expandPath() {
    await expandStore.set(originalPath);

    transitionToCollapsing();

    expandStore.damping = 0;
    expandStore.stiffness = 0;

    expandStore.set(zeroPath);
  }

  async function collapsePath() {
    await collapseStore.set(zeroPath);

    transitionToComplete();
  }

  function dispatchComplete() {
    dispatch('complete');
  }

  function buildPath(pathMap) {
    return Object.keys(pathMap).reduce((acc, key) => {
      const coords = pathMap[key];
      const command = key.replace(/\d+/, '');
      const coordString = coords.join(',');
      const result = `${acc}${command}${coordString}`;

      return result;
    }, '');
  }
</script>

<svelte:options immutable={true} />

<path
  style="fill:none;stroke:#DB3552;stroke-width:0.4099;stroke-linejoin:round;"
  d={buildPath(pathState === PathState.collapsing ? $collapseStore : $expandStore)} />
