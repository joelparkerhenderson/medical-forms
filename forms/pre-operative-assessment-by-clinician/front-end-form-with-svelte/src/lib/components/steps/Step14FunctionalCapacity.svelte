<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 14 — Functional capacity &amp; frailty</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">METs</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.metsEstimate} /></label>
    <label class="block"><span class="text-sm text-slate-700">DASI score</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.dasiScore} /></label>
    <label class="block"><span class="text-sm text-slate-700">Clinical Frailty Scale (1–9)</span>
      <input type="number" min="1" max="9" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.clinicalFrailtyScale} /></label>
    <label class="block"><span class="text-sm text-slate-700">ECOG (0–4)</span>
      <input type="number" min="0" max="4" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.ecogPerformanceStatus} /></label>
    <label class="block"><span class="text-sm text-slate-700">6-min walk (m)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.sixMinuteWalkMetres} /></label>
    <label class="block"><span class="text-sm text-slate-700">CPET performed</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.cpetPerformed}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">CPET VO₂ peak</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.cpetVo2PeakMlKgMin} /></label>
    <label class="block"><span class="text-sm text-slate-700">AT (mL/kg/min)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.cpetAnaerobicThresholdMlKgMin} /></label>
    <label class="block"><span class="text-sm text-slate-700">Malnutrition risk</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.functionalCapacity.malnutritionRisk}>
        <option value="">—</option><option value="none">None</option>
        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
      </select></label>
  </div>
</section>
