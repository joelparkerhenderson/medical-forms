<script lang="ts">
  import { TOTAL_STEPS } from '$lib/config/steps.js';
  let { current = 1 }: { current: number } = $props();
  const pct = $derived(Math.round((current / TOTAL_STEPS) * 100));
</script>

<div class="w-full bg-slate-200 rounded-full h-2" aria-live="polite">
  <div class="bg-brand-600 h-2 rounded-full transition-all" style="width: {pct}%"></div>
</div>
<p class="text-xs text-slate-600 mt-1">Step {current} of {TOTAL_STEPS} — {pct}% complete</p>
