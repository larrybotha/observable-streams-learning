<script>
  import {createEventDispatcher} from 'svelte';

  import Path from './path.svelte';

  import {AnimationState} from './enums';

  export let parsedPaths = [];
  export let svgAttributes = {};
  export let collapsingConfig = {};
  export let expandingConfig = {};
  export let animationState;

  let totalCompletedAnimation = 0;
  let duration = 100;

  const dispatch = createEventDispatcher();

  $: if (animationState === AnimationState.animating) {
    startAnimation();
  }

  $: if (
    animationState === AnimationState.animating &&
    totalCompletedAnimation === parsedPaths.length
  ) {
    setComplete();
  }

  function startAnimation() {
    totalCompletedAnimation = 0;
  }

  function setComplete() {
    dispatch('animationcomplete');
  }

  function handlePathAnimationComplete() {
    totalCompletedAnimation = totalCompletedAnimation + 1;
  }

  $: {
    parsedPaths;
    duration = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  }
</script>

<svelte:options immutable={true} />

<svg {...svgAttributes}>
  {#each parsedPaths as parsedPath, i (JSON.stringify(parsedPath))}
    <Path
      on:complete={handlePathAnimationComplete}
      {parsedPath}
      {collapsingConfig}
      expandingConfig={{...expandingConfig, duration, delay: typeof expandingConfig.delay === 'function' ? expandingConfig.delay(i) : i * 3}}
      state={animationState} />
  {/each}
</svg>
