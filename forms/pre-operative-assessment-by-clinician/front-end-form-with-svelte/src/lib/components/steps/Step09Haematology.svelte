<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 9 — Haematology &amp; coagulation</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Hb (g/L)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.hbGL} /></label>
    <label class="block"><span class="text-sm text-slate-700">Platelets (×10⁹/L)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.platelets109L} /></label>
    <label class="block"><span class="text-sm text-slate-700">INR</span>
      <input type="number" step="0.01" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.inr} /></label>
    <label class="block"><span class="text-sm text-slate-700">APTT (s)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.apttSeconds} /></label>
    <label class="block"><span class="text-sm text-slate-700">On anticoagulant?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.onAnticoagulant}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Anticoag type</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.anticoagulantType}>
        <option value="">—</option><option value="warfarin">Warfarin</option>
        <option value="apixaban">Apixaban</option><option value="rivaroxaban">Rivaroxaban</option>
        <option value="edoxaban">Edoxaban</option><option value="dabigatran">Dabigatran</option>
        <option value="lmwh">LMWH</option><option value="aspirin">Aspirin</option>
        <option value="clopidogrel">Clopidogrel</option><option value="none">None</option>
      </select></label>
    <label class="block md:col-span-3"><span class="text-sm text-slate-700">Hold plan</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.anticoagulantHoldPlan} /></label>
    <label class="block"><span class="text-sm text-slate-700">Group &amp; save</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.groupAndSave}>
        <option value="">—</option><option value="not-required">Not required</option>
        <option value="ordered">Ordered</option><option value="valid">Valid</option><option value="expired">Expired</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Crossmatch units</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.haematology.crossmatchUnits} /></label>
  </div>
</section>
