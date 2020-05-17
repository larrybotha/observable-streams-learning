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
      refreshMachine.withContext({dragY: 0, el, yPos: 0, dragThreshold: reloadHeight}).withConfig({
        actions: {
          handleThresholdReached() {
            window.location.reload();
          },
        },
      }),
    ).start();
  }

  $: if ($service && $service.matches('mousedown')) {
    y.damping = 1;
    y.stiffness = 1;
  }

  $: if ($service && $service.matches('idle')) {
    y.damping = 0.4;
    y.stiffness = 0.1;
  }

  $: if ($service) updateY($service.context.yPos);

  async function updateY(val) {
    await y.set(val * yScalar);
  }
</script>

<Refresh bind:el y={$y} {reloadHeight} {yScalar} />
