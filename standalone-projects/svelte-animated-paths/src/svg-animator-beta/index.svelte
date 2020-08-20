<script>
  import {onDestroy} from 'svelte';
  import parseSvgPath from 'parse-svg-path';
  import absSvgPath from 'abs-svg-path';
  import normalizeSvgPath from 'normalize-svg-path';
  import {interpolate} from 'flubber';
  import d3InterpolatePath from 'd3-interpolate-path';

  import SVG from './svg.svelte';

  import {AnimationState} from './enums';

  export let selector;
  export let svgAttributes = {};
  export let collapsingConfig = undefined;
  export let expandingConfig = undefined;
  export let maxDelay = 0;

  const svgContainer = document.querySelector(selector);
  const svgEls = svgContainer ? [...svgContainer.querySelectorAll('svg')] : [];
  /*const svgs = svgEls.map((svg) =>*/
  /*[...svg.querySelectorAll('path')]*/
  /*.map((path) => path.getAttribute('d'))*/
  /*.filter(Boolean)*/
  /*.map((rawPath) => normalizeSvgPath(absSvgPath(parseSvgPath(rawPath)))),*/
  /*);*/
  const svgAtRestEl = svgEls.find(Boolean);
  const interpolatedSvgs = createSvgSequence(svgAtRestEl, svgEls.slice(1));

  let activeIndex = 0;
  let animationState = AnimationState.atRest;
  let timerId;

  $: activeInterpolatedSvg = interpolatedSvgs[activeIndex];

  $: if (animationState === AnimationState.atRest) {
    queueTransitionToAnimating();
  }

  $: if (animationState === AnimationState.animating) {
    prepareAnimations();
  }

  function getSvgPathData(svgEl) {
    const svgPathData = [...svgEl.querySelectorAll('path, line')].map((el) => {
      const result = /line/i.test(el.tagName) ? parseSvgLine(el) : el.getAttribute('d');

      return result;
    });

    return svgPathData;
  }

  function parseSvgLine(lineEl) {
    const {x1, x2, y1, y2} = lineEl;
    const path = [
      'M',
      x1.baseVal.value,
      y1.baseVal.value,
      'L',
      x2.baseVal.value,
      y2.baseVal.value,
    ].join(' ');

    const parsedPaths = normalizeSvgPath(absSvgPath(parseSvgPath(path)));
    const normalizedPath = parsedPaths.map((xs) => xs.join(' ')).join(' ');

    return normalizedPath;
  }

  function parsePath(rawPath) {
    const result =
      /*normalizeSvgPath(absSvgPath(*/
      parseSvgPath(rawPath);
    /*));*/

    return result;
  }

  function stringifyParsedPaths(parsedPaths) {
    const d = parsedPaths.map((xs) => xs.join(' ')).join(' ');

    return d;
  }

  function normalizePath(rawPath) {
    return stringifyParsedPaths(parsePath(rawPath));
  }

  function createSvgSequence(atRestEl, otherSvgEls) {
    const interpolatedSvgSequence = [...otherSvgEls, atRestEl].reduce(
      (acc, svgEl, i) => {
        const previousSvg = i === 0 ? atRestEl : otherSvgEls[i - 1];
        const nextInterpolatedPaths = [
          getInterpolatedPaths(getSvgPathData(previousSvg), getSvgPathData(svgEl)),
        ];

        return acc.concat(nextInterpolatedPaths);
      },
      [getInterpolatedPaths(getSvgPathData(atRestEl))],
    );

    return interpolatedSvgSequence.slice(1);
  }

  function getInterpolatedPaths(fromPaths, toPaths = fromPaths) {
    const interpolatedPaths = fromPaths.map((fromPath, i) => {
      const toPath = toPaths[i];

      const result = d3InterpolatePath.interpolatePath(
        /*normalizePath(fromPath),*/
        /*normalizePath(toPath),*/
        fromPath.replace(/-/g, ' -'),
        toPath.replace(/-/g, ' -'),
      );
      /*debugger;*/

      return result;
    });

    const pathCommands = fromPaths.map((fromPath, i) => {
      /*const fromCommands = d3InterpolatePath.pathCommandsFromString(fromPath.replace(/-/g, ' -'));*/
      /*const toCommands = d3InterpolatePath.pathCommandsFromString(toPaths[i].replace(/-/g, ' -'));*/
      const fromCommands = d3InterpolatePath.pathCommandsFromString(normalizePath(fromPath));
      const toCommands = d3InterpolatePath.pathCommandsFromString(normalizePath(toPaths[i]));

      const result = d3InterpolatePath.interpolatePathCommands(fromCommands, toCommands);

      return result;
    });

    const anyUnequal = pathCommands.some((fn) => {
      /*const p1 = absSvgPath(parseSvgPath(fn(0)));*/
      /*const p2 = absSvgPath(parseSvgPath(fn(1)));*/
      const p1 = fn(0);
      const p2 = fn(1);
      debugger;

      if (p1.length !== p2.length) {
        debugger;
      }
      return p1.length !== p2.length;
    });

    debugger;
    return interpolatedPaths;
  }

  function queueTransitionToAnimating() {
    const delay = Math.random() * maxDelay;

    if (timerId) {
      timerId = clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        activeIndex = (activeIndex + 1) % interpolatedSvgs.length;
        animationState = AnimationState.animating;
      });
    }, delay);
  }

  function prepareAnimations() {
    activeInterpolatedSvg = interpolatedSvgs[activeIndex];
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
  pathInterpolations={activeInterpolatedSvg}
  {animationState}
  {svgAttributes}
  {collapsingConfig}
  {expandingConfig}
  on:animationcomplete={handleAnimationComplete} />
