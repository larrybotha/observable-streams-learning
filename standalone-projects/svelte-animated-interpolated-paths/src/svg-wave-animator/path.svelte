<script>
  import {createEventDispatcher} from 'svelte';
  import {tweened} from 'svelte/motion';
  import {backOut} from 'svelte/easing';

  import {AnimationState, PathState} from './enums';

  export let parsedPath;
  export let state;
  export let tweenConfig = {};

  let pathState = PathState.atRest;

  const tweenOptions = {
    delay: 0,
    duration: 400,
    easing: backOut,
    ...tweenConfig,
  };

  const originalPath = parsedPath;
  const dispatch = createEventDispatcher();
  const originY = originalPath[0][2];
  const zeroPath = originalPath.reduce(
    (acc, [command, ...xs]) => [
      ...acc,
      [command, ...xs.map((coord, i) => (i % 2 === 0 ? coord : originY))],
    ],
    [],
  );

  let d = zeroPath;

  const expandStores = zeroPath.map(([_, ...xs], i) => {
    const store = tweened(xs, {...tweenOptions, delay: i * 0.05 * tweenOptions.duration});

    store.subscribe((value) => updateDAttribute(i, value));

    return store;
  });
  const collapseStores = originalPath.map(([_, ...xs], i) => {
    const store = tweened(xs, {
      ...tweenOptions,
      delay: i * 0.05 * tweenOptions.duration,
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

  function updateDAttribute(position, coords) {
    d = d.map((xs, i) => (i === position ? [xs[0], ...coords] : xs));
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
    return xxs.reduce((acc, [command, ...xs]) => {
      const coordString = xs.join(',');
      const result = `${acc}${command}${coordString}`;

      return result;
    }, '');
  }
</script>

<svelte:options immutable={true} />

<path d={buildPath(d)} />
