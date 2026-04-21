<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  const yn = ['', 'yes', 'no'] as const;
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 5 — Cardiovascular</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Rhythm</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.heartRhythm}>
        <option value="">—</option><option value="sinus">Sinus</option>
        <option value="atrial-fibrillation">AF</option><option value="flutter">Flutter</option>
        <option value="heart-block">Heart block</option><option value="paced">Paced</option>
        <option value="other">Other</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Murmur</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.murmurPresent}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Echo EF (%)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.echoEfPercent} /></label>
    <label class="block"><span class="text-sm text-slate-700">ECG ischaemic changes</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.ecgIschaemicChanges}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
  </div>
  <h3 class="text-lg font-semibold mt-6 mb-3">RCRI cardiac history</h3>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <label class="block"><span class="text-sm text-slate-700">History IHD</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.historyIhd}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">History CHF</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.historyChf}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">History stroke/TIA</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.historyStrokeTia}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Recent MI &lt; 3/12</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.recentMiWithin3Months}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Pacemaker/ICD</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.pacemakerOrIcd}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Active angina</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.cardiovascular.activeAngina}>
        {#each yn as v}<option value={v}>{v || '—'}</option>{/each}
      </select></label>
  </div>
</section>
