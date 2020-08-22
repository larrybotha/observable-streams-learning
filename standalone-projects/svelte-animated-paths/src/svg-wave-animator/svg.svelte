<script>
  import {createEventDispatcher} from 'svelte';

  import Path from './path.svelte';

  import {AnimationState} from './enums';

  export let parsedPaths = [];
  export let svgAttributes = {};
  export let tweenConfig = {};
  export let animationState;

  let totalCompletedAnimation = 0;
  let duration = 100;
  let key = Date.now();

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
    duration = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
    key = Date.now();
  }
</script>

<svelte:options immutable={true} />

<svg {...svgAttributes}>
  {#each parsedPaths as parsedPath, i (`${key}${i}`)}
    <Path
      on:complete={handlePathAnimationComplete}
      {parsedPath}
      tweenConfig={{...tweenConfig, duration}}
      state={animationState} />
  {/each}
</svg>
