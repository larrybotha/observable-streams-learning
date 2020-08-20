<script>
  import {createEventDispatcher} from 'svelte';

  import Path from './path.svelte';

  import {AnimationState} from './enums';

  export let pathInterpolations = [];
  export let svgAttributes = {};
  export let collapsingConfig = {};
  export let expandingConfig = {};
  export let animationState;

  let totalCompletedAnimation = 0;
  let duration = 100;
  let timestamp = Date.now();

  const dispatch = createEventDispatcher();

  $: if (animationState === AnimationState.animating) {
    startAnimation();
  }

  $: if (
    animationState === AnimationState.animating &&
    totalCompletedAnimation === pathInterpolations.length
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
    pathInterpolations;
    /*duration = Math.floor(Math.random() * (700 - 500 + 1)) + 500;*/
    duration = 2000;
    timestamp = Date.now();
  }
</script>

<svelte:options immutable={true} />

<svg {...svgAttributes}>
  {#each pathInterpolations as pathInterpolation, i (`${timestamp}${i}`)}
    <Path
      on:complete={handlePathAnimationComplete}
      {pathInterpolation}
      {collapsingConfig}
      expandingConfig={{...expandingConfig, duration}}
      state={animationState} />
  {/each}
</svg>
