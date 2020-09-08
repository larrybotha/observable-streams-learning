<script>
  import {interpret} from 'xstate';

  import {oscillatorsMachine} from './machines/oscillators';

  const service = interpret(oscillatorsMachine).start();
  let y = 0;
  const MAX_RADIUS = 20;

  $: oscillators = $service.context.oscillators;
  $: radius = Math.max(0, y * MAX_RADIUS);

  function addOscillator() {
    service.send('ADD_OSCILLATOR');
  }

  function augment() {
    service.send('AUGMENT_PHASE_DURATION', {data: 1000});
  }
</script>

{y}
<br />

<svg viewBox="0 0 600 200">
  <circle fill="hotpink" cx="100" cy="100" r={radius} />
</svg>

<button on:click={addOscillator}>add oscillator</button>
<button on:click={augment}>augment</button>

{#each oscillators as oscillatorService}
  <pre>{JSON.stringify(oscillatorService.state.context, null, 2)}</pre>
{/each}
