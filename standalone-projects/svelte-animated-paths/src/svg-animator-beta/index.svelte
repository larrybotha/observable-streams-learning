<script>
  import {onDestroy} from 'svelte';
  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';

  import SVG from './svg.svelte';

  import {AnimationState} from './enums';

  export let selector;
  export let numGradientStops = undefined;
  export let svgAttributes = {};
  export let collapsingConfig = undefined;
  export let expandingConfig = undefined;
  export let maxDelay = 0;

  const svgContainer = document.querySelector(selector);
  const svgEls = svgContainer ? [...svgContainer.querySelectorAll('svg')] : [];
  const svgs = svgEls.map((svg) =>
    [...svg.querySelectorAll('path')]
      .map((path) => path.getAttribute('d'))
      .filter(Boolean)
      .map((rawPath) => normalizeSvgPath(absSvgPath(parseSvgPath(rawPath)))),
  );
  let activeIndex = 0;
  let animationState = AnimationState.atRest;
  let timerId;

  $: activeSvg = svgs[activeIndex];

  $: if (animationState === AnimationState.atRest) {
    queueTransitionToAnimating();
  }

  $: if (animationState === AnimationState.animating) {
    prepareAnimations();
  }

  function queueTransitionToAnimating() {
    const delay = Math.random() * maxDelay;

    if (timerId) {
      timerId = clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        activeIndex = (activeIndex + 1) % svgs.length;
        animationState = AnimationState.animating;
      });
    }, delay);
  }

  function prepareAnimations() {
    activeSvg = svgs[activeIndex];
  }

  function handleAnimationComplete() {
    animationState = AnimationState.atRest;
  }

  onDestroy(() => {
    clearTimeout(timerId);
  });
</script>

<svelte:options immutable={true} />

<SVG
  parsedPaths={activeSvg}
  {numGradientStops}
  {animationState}
  {svgAttributes}
  {collapsingConfig}
  {expandingConfig}
  on:animationcomplete={handleAnimationComplete} />
