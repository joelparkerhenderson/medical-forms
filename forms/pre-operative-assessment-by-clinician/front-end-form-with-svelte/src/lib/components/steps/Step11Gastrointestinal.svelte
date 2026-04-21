<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 11 — Gastrointestinal</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Abdominal exam</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.abdominalExam}>
        <option value="">—</option><option value="normal">Normal</option>
        <option value="distended">Distended</option><option value="tender">Tender</option>
        <option value="organomegaly">Organomegaly</option><option value="other">Other</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Reflux</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.refluxSymptoms}>
        <option value="">—</option><option value="none">None</option>
        <option value="occasional">Occasional</option><option value="frequent">Frequent</option><option value="severe">Severe</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Hiatus hernia</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.hiatusHernia}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Fasting confirmed</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.fastingConfirmed}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Last solid food</span>
      <input type="datetime-local" class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.lastSolidFoodAt} /></label>
    <label class="block"><span class="text-sm text-slate-700">Last clear fluid</span>
      <input type="datetime-local" class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.lastClearFluidAt} /></label>
    <label class="block"><span class="text-sm text-slate-700">RSI needed?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.gastrointestinal.rapidSequenceInductionNeeded}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
  </div>
</section>
