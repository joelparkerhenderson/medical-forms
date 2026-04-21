<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 15 — Anaesthesia &amp; post-op plan</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Technique</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.technique}>
        <option value="">—</option>
        <option value="ga">GA</option><option value="regional">Regional</option>
        <option value="neuraxial">Neuraxial</option><option value="sedation">Sedation</option>
        <option value="mac">MAC</option><option value="local">Local</option>
        <option value="combined-ga-regional">Combined GA + regional</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Airway plan</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.airwayPlan}>
        <option value="">—</option>
        <option value="face-mask">Face mask</option><option value="supraglottic">Supraglottic</option>
        <option value="ett">ETT</option><option value="awake-fibreoptic">Awake fibreoptic</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">RSI planned?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.rsiPlanned}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Monitoring</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.monitoringLevel}>
        <option value="">—</option>
        <option value="standard">Standard</option><option value="invasive-arterial">Arterial line</option>
        <option value="invasive-cvc">CVC</option><option value="cardiac-output">Cardiac output</option>
      </select></label>
    <label class="block md:col-span-2"><span class="text-sm text-slate-700">Analgesia plan</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.analgesiaPlan} /></label>
    <label class="block"><span class="text-sm text-slate-700">DVT prophylaxis</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.dvtProphylaxis} /></label>
    <label class="block"><span class="text-sm text-slate-700">Antibiotic prophylaxis</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.antibioticProphylaxis} /></label>
    <label class="block"><span class="text-sm text-slate-700">Disposition</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.postOpDisposition}>
        <option value="">—</option>
        <option value="day-case">Day case</option><option value="ward">Ward</option>
        <option value="enhanced-care">Enhanced care</option>
        <option value="hdu">HDU</option><option value="icu">ICU</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">LOS (days)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.anaesthesiaPlan.anticipatedLengthOfStayDays} /></label>
  </div>
</section>
