<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<section class="prose max-w-none">
  <h2 class="text-xl font-semibold">Start a new pre-operative assessment</h2>
  <p class="text-slate-700 my-4">
    This tool collects 16 steps of clinician-observed data, computes an ASA
    Physical Status grade (I–VI), Mallampati airway class, RCRI, STOP-BANG,
    Clinical Frailty Scale, and a composite perioperative risk. A signed PDF
    report is produced for the pre-op record.
  </p>
  <button
    type="button"
    class="mt-4 px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700"
    onclick={() => goto('/assessment/1')}
  >
    Begin assessment
  </button>
</section>
