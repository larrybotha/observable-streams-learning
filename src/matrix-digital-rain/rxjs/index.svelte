<script>
  import { matrix$ } from "./streams/matrix.ts";
  import Matrix from "../components/matrix.svelte";
</script>

<Matrix {matrix$} />
