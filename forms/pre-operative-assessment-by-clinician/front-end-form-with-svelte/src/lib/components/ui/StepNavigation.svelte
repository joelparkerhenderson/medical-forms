<script lang="ts">
  import { goto } from '$app/navigation';
  import { TOTAL_STEPS } from '$lib/config/steps.js';

  let { current }: { current: number } = $props();

  function back() {
    if (current > 1) goto(`/assessment/${current - 1}`);
  }
  function next() {
    if (current < TOTAL_STEPS) goto(`/assessment/${current + 1}`);
    else goto('/report');
  }
</script>

<div class="flex justify-between mt-8 pt-4 border-t border-slate-200">
  <button
    type="button"
    class="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
    disabled={current === 1}
    onclick={back}
  >
    Back
  </button>
  <button
    type="button"
    class="px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700"
    onclick={next}
  >
    {current === TOTAL_STEPS ? 'View report' : 'Next'}
  </button>
</div>
