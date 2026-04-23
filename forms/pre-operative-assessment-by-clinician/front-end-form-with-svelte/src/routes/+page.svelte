<script lang="ts">
  import { goto } from '$app/navigation';
  import { STEPS } from '$lib/config/steps.js';
  import Step01 from '$lib/components/steps/Step01Clinician.svelte';
  import Step02 from '$lib/components/steps/Step02Patient.svelte';
  import Step03 from '$lib/components/steps/Step03Vitals.svelte';
  import Step04 from '$lib/components/steps/Step04Airway.svelte';
  import Step05 from '$lib/components/steps/Step05Cardiovascular.svelte';
  import Step06 from '$lib/components/steps/Step06Respiratory.svelte';
  import Step07 from '$lib/components/steps/Step07Neurological.svelte';
  import Step08 from '$lib/components/steps/Step08RenalHepatic.svelte';
  import Step09 from '$lib/components/steps/Step09Haematology.svelte';
  import Step10 from '$lib/components/steps/Step10Endocrine.svelte';
  import Step11 from '$lib/components/steps/Step11Gastrointestinal.svelte';
  import Step12 from '$lib/components/steps/Step12Musculoskeletal.svelte';
  import Step13 from '$lib/components/steps/Step13Medications.svelte';
  import Step14 from '$lib/components/steps/Step14FunctionalCapacity.svelte';
  import Step15 from '$lib/components/steps/Step15AnaesthesiaPlan.svelte';
  import Step16 from '$lib/components/steps/Step16Summary.svelte';

  const stepComponents = [
    Step01, Step02, Step03, Step04, Step05, Step06, Step07, Step08,
    Step09, Step10, Step11, Step12, Step13, Step14, Step15, Step16
  ];
</script>

<section class="prose max-w-none">
  <h2 class="text-xl font-semibold">Pre-operative assessment</h2>
  <p class="text-slate-700 my-4">
    Complete all 16 sections below, then generate the report. The tool computes an ASA
    Physical Status grade (I&ndash;VI), Mallampati airway class, RCRI, STOP-BANG,
    Clinical Frailty Scale, and a composite perioperative risk.
  </p>
</section>

<nav aria-label="Sections" class="sticky top-0 bg-white border-b border-slate-200 py-2 my-4 overflow-x-auto z-10">
  <ol class="flex gap-3 text-sm">
    {#each STEPS as s (s.number)}
      <li>
        <a href="#step-{s.number}" class="text-brand-600 hover:underline whitespace-nowrap">
          {s.number}. {s.short}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<div class="space-y-8">
  {#each stepComponents as StepComponent, i (i)}
    <div id="step-{i + 1}" class="bg-white p-6 rounded-lg shadow-sm scroll-mt-20">
      <StepComponent />
    </div>
  {/each}
</div>

<div class="mt-8 pt-4 border-t border-slate-200 flex justify-end">
  <button
    type="button"
    class="px-4 py-2 rounded bg-brand-600 text-white hover:bg-brand-700"
    onclick={() => goto('/report')}
  >
    Generate report
  </button>
</div>
