<script lang="ts">
  import { page } from '$app/stores';
  import StepNavigation from '$lib/components/ui/StepNavigation.svelte';
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

  const step = $derived(Number($page.params.step));
</script>

{#if step === 1}<Step01 />
{:else if step === 2}<Step02 />
{:else if step === 3}<Step03 />
{:else if step === 4}<Step04 />
{:else if step === 5}<Step05 />
{:else if step === 6}<Step06 />
{:else if step === 7}<Step07 />
{:else if step === 8}<Step08 />
{:else if step === 9}<Step09 />
{:else if step === 10}<Step10 />
{:else if step === 11}<Step11 />
{:else if step === 12}<Step12 />
{:else if step === 13}<Step13 />
{:else if step === 14}<Step14 />
{:else if step === 15}<Step15 />
{:else if step === 16}<Step16 />
{/if}

<StepNavigation current={step} />
