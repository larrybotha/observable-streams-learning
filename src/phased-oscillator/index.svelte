<script>
  import {interpret} from 'xstate';

  import {oscillatingMachine} from './machines/oscillator';

  const service = interpret(oscillatingMachine).start();
  let y;

  $: lastResetTime = $service.context.lastResetTime;
  $: phaseAugmentation = $service.context.phaseAugmentation;
  $: resetDelay = $service.context.resetDelay;

  function render() {
    const timeSinceReset = Date.now() - lastResetTime;
    const timeRemaining = timeSinceReset + phaseAugmentation;
    const ratioOfDuration = timeRemaining / resetDelay;

    y = Math.sin((Math.PI / 2) * ratioOfDuration);

    requestAnimationFrame(render);
  }

  function augment() {
    service.send('AUGMENT_PHASE_DURATION', {data: 1000});
  }

  requestAnimationFrame(render);
</script>

{y}
<br />

<button on:click={augment}>augment</button>
<pre>{JSON.stringify($service.value, null, 2)}</pre>
<pre>{JSON.stringify($service.context, null, 2)}</pre>
