<script>
  import { matrix$ } from "./_streams/matrix.ts";
  import Matrix from "../../components/matrix.svelte";

  $: console.log($matrix$);
</script>

<Matrix {matrix$} />
