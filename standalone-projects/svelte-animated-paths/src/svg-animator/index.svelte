<script>
  import {onDestroy, onMount} from 'svelte';
  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  import Path from './path.svelte';

  import {AnimationState} from './enums';

  export let selector;
  export let svgAttributes = {};
  export let collapsingConfig = undefined;
  export let expandingConfig = undefined;
  export let maxDelay = 1000;

  let state = AnimationState.atRest;
  let totalCompletedAnimation = 0;
  let timerId;

  const el = document.querySelector(selector);
  const rawPaths = el ? [...el.querySelectorAll('path')].map((path) => path.getAttribute('d')) : [];
  const parsedPaths = rawPaths.map((rawPath) =>
    normalizeSvgPath(absSvgPath(parseSvgPath(rawPath))),
  );

  $: if (totalCompletedAnimation === rawPaths.length && state === AnimationState.expanding) {
    initiateCollapsing();
  }

  $: if (totalCompletedAnimation === rawPaths.length && state === AnimationState.collapsing) {
    resetState();
  }

  $: if (state === AnimationState.atRest) {
    queueAnimation();
  }

  function queueAnimation() {
    const delay = Math.random() * maxDelay;

    if (timerId) {
      timerId = clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        initiateExpanding();
      });
    }, delay);
  }

  function initiateExpanding() {
    state = AnimationState.expanding;
    totalCompletedAnimation = 0;
  }

  function initiateCollapsing() {
    state = AnimationState.collapsing;
    totalCompletedAnimation = 0;
  }

  function resetState() {
    state = AnimationState.atRest;
    totalCompletedAnimation = 0;
  }

  function handleCollapseEnd() {
    totalCompletedAnimation = totalCompletedAnimation + 1;
  }

  function handleExpandEnd() {
    totalCompletedAnimation = totalCompletedAnimation + 1;
  }

  onMount(queueAnimation);
  onDestroy(() => {
    clearTimeout(timerId);
  });
</script>

<svelte:options immutable={true} />

<svg xmlns="http://www.w3.org/2000/svg" {...svgAttributes}>
  {#each parsedPaths as parsedPath, i (i)}
    <Path
      on:collapseend={handleCollapseEnd}
      on:expandend={handleExpandEnd}
      {parsedPath}
      {collapsingConfig}
      {expandingConfig}
      {state} />
  {/each}
</svg>
