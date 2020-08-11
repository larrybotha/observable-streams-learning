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
  let y;

  function augment() {
    service.send('AUGMENT_PHASE_DURATION', {data: 1000});
  }

  /*requestAnimationFrame(render);*/
</script>

{y}
<br />

<button on:click={augment}>augment</button>
<pre>{JSON.stringify($service.value, null, 2)}</pre>
<pre>{JSON.stringify($service.context, null, 2)}</pre>
