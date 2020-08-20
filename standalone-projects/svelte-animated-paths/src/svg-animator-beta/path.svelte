<script>
  import {createEventDispatcher} from 'svelte';
  import {spring, tweened} from 'svelte/motion';
  import {quartIn, quintOut} from 'svelte/easing';

  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  import {AnimationState, PathState} from './enums';

  export let pathInterpolation;
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
  const fromPath = getTweenablePath(pathInterpolation(0));
  const toPath = getTweenablePath(pathInterpolation(1));

  const expandStore = tweened(toPath, expandingOptions);
  /*const collapseStore = spring(fromPath, collapsingOptions);*/
  const collapseStore = tweened(fromPath, {
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

  /*function getTweenablePath(xs) {*/
  /*const rawPath = 'M' + xs.join('L');*/

  /*const parsedPath = normalizeSvgPath(absSvgPath(parseSvgPath(rawPath)));*/
  /*const tweenablePath = parsedPath.reduce((acc, [command, ...xs], i) => {*/
  /*return {...acc, [`${command}${i}`]: xs};*/
  /*}, {});*/

  /*return tweenablePath;*/
  /*}*/

  function getTweenablePath(rawResultPath) {
    const parsedResultPath = normalizeSvgPath(absSvgPath(parseSvgPath(rawResultPath)));

    const tweenablePath = parsedResultPath.reduce((acc, [command, ...xs], i) => {
      return {...acc, [`${command}${i}`]: xs};
    }, {});

    return tweenablePath;
  }

  async function expandPath() {
    await expandStore.set(fromPath);

    transitionToCollapsing();

    expandStore.damping = 0;
    expandStore.stiffness = 0;

    expandStore.set(toPath);
  }

  async function collapsePath() {
    await collapseStore.set(toPath);

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
