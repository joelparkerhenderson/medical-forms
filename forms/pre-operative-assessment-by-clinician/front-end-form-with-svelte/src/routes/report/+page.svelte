<script lang="ts">
  import { store } from '$lib/stores/assessment.svelte.js';
  import FlagBanner from '$lib/components/ui/FlagBanner.svelte';
  const r = $derived(store.result);
  const d = $derived(store.data);
</script>

<section class="bg-white p-6 rounded-lg shadow-sm">
  <h2 class="text-2xl font-bold mb-4">Pre-operative Assessment Report</h2>

  <div class="grid grid-cols-2 gap-4 mb-4">
    <div>
      <h3 class="font-semibold text-slate-700">Clinician</h3>
      <p>{d.clinician.clinicianName} ({d.clinician.clinicianRole})</p>
      <p class="text-sm text-slate-600">
        {d.clinician.registrationBody} {d.clinician.registrationNumber}
      </p>
      <p class="text-sm text-slate-600">
        {d.clinician.assessmentDate} {d.clinician.assessmentTime} — {d.clinician.siteName}
      </p>
    </div>
    <div>
      <h3 class="font-semibold text-slate-700">Patient</h3>
      <p>{d.patient.firstName} {d.patient.lastName}</p>
      <p class="text-sm text-slate-600">NHS {d.patient.nhsNumber} — DOB {d.patient.dateOfBirth}</p>
      <p class="text-sm text-slate-600">Weight {d.patient.weightKg ?? '—'} kg · Height {d.patient.heightCm ?? '—'} cm</p>
    </div>
  </div>

  <div class="bg-slate-100 p-4 rounded mb-4">
    <p class="text-lg">
      <strong>Computed ASA:</strong> {r.computedAsaGrade}{r.asaEmergencySuffix}
      {#if d.summary.finalAsaGrade && d.summary.finalAsaGrade !== r.computedAsaGrade}
        <span class="text-orange-700">→ Clinician final: {d.summary.finalAsaGrade}</span>
      {/if}
    </p>
    <p>
      Mallampati {r.mallampatiClass || '—'} · RCRI {r.rcriScore} · STOP-BANG {r.stopbangScore} ·
      CFS {r.frailtyScale ?? '—'}
    </p>
    <p><strong>Composite risk:</strong> {r.compositeRisk.toUpperCase()}</p>
    <p><strong>Recommendation:</strong> {d.summary.recommendation || '—'}</p>
  </div>

  <FlagBanner flags={r.additionalFlags} risk={r.compositeRisk} />

  <h3 class="font-semibold mt-6 mb-2">Anaesthesia plan</h3>
  <p>Technique: {d.anaesthesiaPlan.technique || '—'}</p>
  <p>Airway: {d.anaesthesiaPlan.airwayPlan || '—'}</p>
  <p>Monitoring: {d.anaesthesiaPlan.monitoringLevel || '—'}</p>
  <p>Disposition: {d.anaesthesiaPlan.postOpDisposition || '—'}</p>
  <p>Analgesia: {d.anaesthesiaPlan.analgesiaPlan || '—'}</p>

  <h3 class="font-semibold mt-6 mb-2">Clinician notes</h3>
  <p class="whitespace-pre-wrap">{d.summary.clinicianNotes || '—'}</p>

  <div class="mt-8 flex gap-3">
    <a href="/report/pdf" class="px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700">
      Download PDF
    </a>
    <a href="/assessment/16" class="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100">
      Back to summary
    </a>
  </div>
</section>
