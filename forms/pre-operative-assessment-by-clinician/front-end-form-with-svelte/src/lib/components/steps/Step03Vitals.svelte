<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 3 — Vital signs &amp; anthropometrics</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Systolic BP (mmHg)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.systolicBp} /></label>
    <label class="block"><span class="text-sm text-slate-700">Diastolic BP (mmHg)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.diastolicBp} /></label>
    <label class="block"><span class="text-sm text-slate-700">Heart rate (bpm)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.heartRate} /></label>
    <label class="block"><span class="text-sm text-slate-700">Respiratory rate</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.respiratoryRate} /></label>
    <label class="block"><span class="text-sm text-slate-700">SpO₂ (%)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.spo2Percent} /></label>
    <label class="block"><span class="text-sm text-slate-700">Temperature (°C)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.temperatureCelsius} /></label>
    <label class="block"><span class="text-sm text-slate-700">On room air?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.onRoomAir}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">O₂ flow (L/min)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.supplementalOxygenLitres} /></label>
    <label class="block"><span class="text-sm text-slate-700">Pain 0–10</span>
      <input type="number" min="0" max="10" class="w-full border rounded px-2 py-1" bind:value={store.data.vitals.painScore010} /></label>
  </div>
</section>
