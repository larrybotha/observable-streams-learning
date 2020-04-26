<script>
  import { matrix$ } from "./_streams/matrix.ts";
  import { readable } from "svelte/store";
  import Matrix from "../../components/matrix.svelte";
</script>

{#if $matrix$}
  <Matrix {matrix$} />
{/if}
