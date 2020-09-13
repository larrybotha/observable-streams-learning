<script>
  import {createEventDispatcher} from 'svelte';
  import {tweened} from 'svelte/motion';
  import {backOut} from 'svelte/easing';

  import {AnimationState, PathState} from './enums';

  export let parsedPath;
  export let state;
  export let expandingConfig = {};
  export let collapsingConfig = {};

  let pathState = PathState.atRest;

  const expandingOptions = {
    delay: 0,
    duration: 1000,
    easing: backOut,
    ...expandingConfig,
  };

  const collapsingOptions = {
    damping: 0.2,
    precision: 0.01,
    stiffness: 0.3,
    ...collapsingConfig,
  };

  const originalPath = parsedPath;
  const dispatch = createEventDispatcher();
  const originY = originalPath[0][2];
  const zeroPath = originalPath.reduce(
    (acc, [command, ...xs], i) => [
      ...acc,
      [command, ...xs.map((coord, i) => (i % 2 === 0 ? coord : originY))],
    ],
    [],
  );

  let d = zeroPath;

  function updateDAttribute(position, coords) {
    d = d.map((xs, i) => (i === position ? [xs[0], ...coords] : xs));
  }

  const expandStores = zeroPath.map(([_, ...xs], i) => {
    const store = tweened(xs, {...expandingOptions, delay: i * 0.05 * expandingOptions.duration});

    store.subscribe((value) => updateDAttribute(i, value));

    return store;
  });
  const collapseStores = originalPath.map(([_, ...xs], i) => {
    const store = tweened(xs, {
      ...expandingOptions,
      delay: i * 0.05 * expandingOptions.duration,
    });

    store.subscribe((value) => updateDAttribute(i, value));

    return store;
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
    d = zeroPath;

    await Promise.all(
      expandStores.map(async (store, i) => {
        const [, ...xs] = originalPath[i];

        await store.set(xs);
      }),
    );

    transitionToCollapsing();

    expandStores.map((store, i) => {
      /*store.damping = 0;*/
      /*store.stiffness = 0;*/
      /*store.set(zeroPath[i]);*/
    });
  }

  async function collapsePath() {
    await Promise.all(
      collapseStores.map(async (store, i) => {
        const [, ...xs] = zeroPath[i];

        await store.set(xs);
      }),
    );

    transitionToComplete();
  }

  function dispatchComplete() {
    dispatch('complete');
  }

  function buildPath(xxs) {
    const result = xxs.reduce((acc, [command, ...xs]) => {
      const coordString = xs.join(',');

      const result = `${acc}${command}${coordString}`;

      return result;
    }, '');

    return result;
  }
</script>

<svelte:options immutable={true} />

<path d={buildPath(d)} />
