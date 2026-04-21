<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 8 — Renal &amp; hepatic</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Creatinine (µmol/L)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.creatinineUmolL} /></label>
    <label class="block"><span class="text-sm text-slate-700">eGFR</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.egfrMlMin173m2} /></label>
    <label class="block"><span class="text-sm text-slate-700">CKD stage</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.ckdStage}>
        <option value="">—</option><option value="1">1</option><option value="2">2</option>
        <option value="3a">3a</option><option value="3b">3b</option><option value="4">4</option><option value="5">5</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Dialysis</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.dialysisStatus}>
        <option value="">—</option><option value="none">None</option>
        <option value="peritoneal">Peritoneal</option><option value="haemodialysis">HD</option>
        <option value="haemofiltration">HF</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Bilirubin (µmol/L)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.bilirubinUmolL} /></label>
    <label class="block"><span class="text-sm text-slate-700">Albumin (g/L)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.albuminGL} /></label>
    <label class="block"><span class="text-sm text-slate-700">ALT (U/L)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.altUL} /></label>
    <label class="block"><span class="text-sm text-slate-700">Liver disease</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.chronicLiverDisease}>
        <option value="">—</option><option value="none">None</option>
        <option value="compensated">Compensated</option><option value="decompensated">Decompensated</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Child-Pugh</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.renalHepatic.childPughClass}>
        <option value="">—</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
      </select></label>
  </div>
</section>
