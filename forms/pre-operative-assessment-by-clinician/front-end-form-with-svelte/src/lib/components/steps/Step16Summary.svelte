<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  import FlagBanner from '$lib/components/ui/FlagBanner.svelte';
  const r = $derived(store.result);
</script>

<section>
  <h2 class="text-xl font-semibold mb-4">Step 16 — Summary, ASA &amp; sign-off</h2>

  <div class="bg-slate-100 p-4 rounded mb-4">
    <p><strong>Computed ASA grade:</strong> {r.computedAsaGrade}{r.asaEmergencySuffix}</p>
    <p><strong>Mallampati:</strong> {r.mallampatiClass || '—'}</p>
    <p><strong>RCRI score:</strong> {r.rcriScore}</p>
    <p><strong>STOP-BANG score:</strong> {r.stopbangScore}</p>
    <p><strong>Clinical Frailty Scale:</strong> {r.frailtyScale ?? '—'}</p>
    <p><strong>Composite risk:</strong> {r.compositeRisk.toUpperCase()}</p>
  </div>

  <FlagBanner flags={r.additionalFlags} risk={r.compositeRisk} />

  {#if r.firedRules.length > 0}
    <details class="mb-4">
      <summary class="cursor-pointer text-sm font-medium">Fired rules ({r.firedRules.length})</summary>
      <ul class="list-disc list-inside text-sm mt-2 space-y-1">
        {#each r.firedRules as f}
          <li><code>{f.ruleId}</code> [{f.instrument}] — {f.description}</li>
        {/each}
      </ul>
    </details>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block"><span class="text-sm text-slate-700">Final ASA (override)</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.summary.finalAsaGrade}>
        <option value="">Use computed ({r.computedAsaGrade})</option>
        <option value="I">I</option><option value="II">II</option><option value="III">III</option>
        <option value="IV">IV</option><option value="V">V</option><option value="VI">VI</option>
      </select></label>
    <label class="block"><span class="text-sm text-slate-700">Recommendation</span>
      <select class="w-full border rounded px-2 py-1" bind:value={store.data.summary.recommendation}>
        <option value="">—</option>
        <option value="proceed">Proceed</option>
        <option value="optimise-first">Optimise first</option>
        <option value="mdt-review">MDT review</option>
        <option value="cancel">Cancel</option>
      </select></label>
    <label class="block md:col-span-2"><span class="text-sm text-slate-700">Override reason (required if overriding)</span>
      <input type="text" class="w-full border rounded px-2 py-1" bind:value={store.data.summary.overrideReason} /></label>
    <label class="block md:col-span-2"><span class="text-sm text-slate-700">Clinician notes</span>
      <textarea rows="4" class="w-full border rounded px-2 py-1" bind:value={store.data.summary.clinicianNotes}></textarea></label>
  </div>

  <p class="text-sm text-slate-600 mt-6">
    By signing, the clinician confirms that the assessment above was made on
    objective findings and that the anaesthesia plan is appropriate. Signed
    timestamp will be added on submission.
  </p>
</section>
