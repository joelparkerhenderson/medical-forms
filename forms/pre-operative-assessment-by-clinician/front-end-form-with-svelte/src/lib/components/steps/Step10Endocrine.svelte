<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 10 — Endocrine</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Diabetes type</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.diabetesType}>
        <option value="">—</option><option value="none">None</option>
        <option value="type-1">Type 1</option><option value="type-2">Type 2</option>
        <option value="gestational">Gestational</option><option value="other">Other</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">On insulin?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.diabetesOnInsulin}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">HbA1c (mmol/mol)</span>
      <input type="number" class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.hba1cMmolMol} /></label>
    <label class="block"><span class="text-sm text-slate-700">Fasting glucose (mmol/L)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.fastingGlucoseMmolL} /></label>
    <label class="block"><span class="text-sm text-slate-700">Control</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.diabetesControl}>
        <option value="">—</option><option value="well-controlled">Well-controlled</option>
        <option value="suboptimal">Suboptimal</option><option value="poor">Poor</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Thyroid</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.thyroidStatus}>
        <option value="">—</option><option value="euthyroid">Euthyroid</option>
        <option value="hypothyroid">Hypothyroid</option><option value="hyperthyroid">Hyperthyroid</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Long-term steroids?</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.onLongTermSteroids}>
        <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Steroid dose (mg prednisolone-eq.)</span>
      <input type="number" step="0.1" class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.steroidDoseMg} /></label>
    <label class="block md:col-span-3"><span class="text-sm text-slate-700">Steroid cover plan</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.endocrine.steroidCoverPlan} /></label>
  </div>
</section>
