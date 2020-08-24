<script>
  import {interpret} from 'xstate';

  import {oscillatingMachine, defaultContext} from './machines/oscillator';

  const service = interpret(
    oscillatingMachine.withContext({
      ...defaultContext,
      progressCallback: (progress) => {
        y = progress;
      },
    }),
  ).start();
  let y = 0;
  const MAX_RADIUS = 20;

$: radius = Math.max(0, y * MAX_RADIUS)

  function augment() {
    service.send('AUGMENT_PHASE_DURATION', {data: 1000});
  }
</script>

{y}
<br />

<button on:click={augment}>augment</button>
<pre>{JSON.stringify($service.value, null, 2)}</pre>
<pre>{JSON.stringify($service.context, null, 2)}</pre>

<svg viewBox="0 0 600 200">
  <circle fill="hotpink" cx="100" cy="100" r={radius} />
</svg>
