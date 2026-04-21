<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 7 — Neurological &amp; cognition</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">GCS total (3–15)</span>
      <input type="number" min="3" max="15" class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.gcsTotal} /></label>
    <label class="block"><span class="text-sm text-slate-700">Cognitive tool</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.cognitionTool}>
        <option value="">—</option><option value="AMT-4">AMT-4</option>
        <option value="MOCA">MOCA</option><option value="MMSE">MMSE</option><option value="none">None</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Cognitive score</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.cognitionScore} /></label>
    <label class="block"><span class="text-sm text-slate-700">Cognitive impairment</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.cognitiveImpairment}>
        <option value="">—</option><option value="none">None</option><option value="mild">Mild</option>
        <option value="moderate">Moderate</option><option value="severe">Severe</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Capacity concern</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.capacityConcern}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Recent stroke/TIA</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.recentStrokeTia}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Days since stroke/TIA</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.neurological.daysSinceStrokeTia} /></label>
  </div>
</section>
