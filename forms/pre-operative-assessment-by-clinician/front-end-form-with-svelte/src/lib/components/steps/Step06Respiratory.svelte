<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 6 — Respiratory</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Asthma</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.asthma}>
        <option value="">—</option><option value="none">None</option>
        <option value="controlled">Controlled</option><option value="uncontrolled">Uncontrolled</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">COPD</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.copd}>
        <option value="">—</option><option value="none">None</option>
        <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">FEV₁ (% predicted)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.pftFev1PercentPredicted} /></label>
    <label class="block"><span class="text-sm text-slate-700">Smoking status</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.smokingStatus}>
        <option value="">—</option><option value="never">Never</option>
        <option value="ex">Ex-smoker</option><option value="current">Current</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Pack-years</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.packYears} /></label>
    <label class="block"><span class="text-sm text-slate-700">COVID-19 history</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.covidHistory}>
        <option value="">—</option><option value="never">Never</option>
        <option value="recovered">Recovered</option><option value="recent">Recent (&lt; 7 wk)</option>
        <option value="long-covid">Long COVID</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Days since COVID</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.respiratory.daysSinceCovid} /></label>
  </div>
</section>
