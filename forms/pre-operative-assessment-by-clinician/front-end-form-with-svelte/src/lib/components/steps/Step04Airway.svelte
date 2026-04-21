<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  const sb = $derived([
    ['stopbangSnoring', 'Loud snoring'],
    ['stopbangTired', 'Daytime tired'],
    ['stopbangObservedApnoea', 'Observed apnoea'],
    ['stopbangPressure', 'Treated for HTN'],
    ['stopbangBmiGt35', 'BMI > 35'],
    ['stopbangAgeGt50', 'Age > 50'],
    ['stopbangNeckGt40', 'Neck > 40 cm'],
    ['stopbangMale', 'Male'],
  ] as const);
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 4 — Airway assessment</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Mallampati</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.airway.mallampatiClass}>
        <option value="">—</option><option value="I">I</option><option value="II">II</option>
        <option value="III">III</option><option value="IV">IV</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Thyromental distance (cm)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.airway.thyromentalDistanceCm} /></label>
    <label class="block"><span class="text-sm text-slate-700">Mouth opening (cm)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.airway.mouthOpeningCm} /></label>
    <label class="block"><span class="text-sm text-slate-700">Neck ROM</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.airway.neckRom}>
        <option value="">—</option><option value="full">Full</option>
        <option value="reduced">Reduced</option><option value="severely-limited">Severely limited</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Dentition</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.airway.dentition}>
        <option value="">—</option><option value="good">Good</option><option value="loose-teeth">Loose teeth</option>
        <option value="caps-crowns">Caps/crowns</option><option value="edentulous">Edentulous</option>
        <option value="dentures">Dentures</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Prior difficult intubation</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.airway.priorDifficultIntubation}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
  </div>
  <h3 class="text-lg font-semibold mt-6 mb-3">STOP-BANG</h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    {#each sb as [key, label]}
      <label class="block"><span class="text-sm text-slate-700">{label}</span>
        <select class="w-full border rounded px-2 py-1" bind:value={store.data.airway[key]}>
          <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
        </select></label>
    {/each}
  </div>
</section>
