<script>
  import {spring} from 'svelte/motion';
  import {interpret} from 'xstate';

  import {refreshMachine} from './machine.ts';
  import Refresh from '../components/refresh.svelte';

  const reloadScalar = 0.5;
  const reloadHeight = window.innerHeight * reloadScalar;
  const yScalar = 1 / Math.sqrt(5);
  const y = spring(0);

  let el;
  let service;

  $: if (el) {
    service = interpret(
      refreshMachine
        .withContext({
          dragY: 0,
          el,
          yPos: 0,
          dragThreshold: reloadHeight,
        })
        .withConfig({
          actions: {
            handleThresholdReached() {
              window.location.reload();
            },
          },
        }),
    ).start();
  }

  $: if ($service && $service.matches('dragging')) {
    console.log('dragging');
  }

  $: if ($service && $service.matches('mousedown')) {
    console.log('mousedown');
    y.damping = 1;
    y.stiffness = 1;
  }

  $: if ($service && $service.matches('idle')) {
    console.log('idle');
    y.damping = 0.4;
    y.stiffness = 0.1;
    y.set(0);
  }

  $: if ($service) y.set($service.context.yPos * yScalar);
</script>

<Refresh bind:el y={$y} {reloadHeight} {yScalar} />
