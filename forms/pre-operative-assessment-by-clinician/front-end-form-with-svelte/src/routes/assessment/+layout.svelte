<script lang="ts">
  import { page } from '$app/stores';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
  let { children }: { children: () => unknown } = $props();
  const step = $derived(Number($page.params.step ?? 1));
</script>

<ProgressBar current={step} />
<div class="mt-6 bg-white p-6 rounded-lg shadow-sm">
  {@render children()}
</div>
