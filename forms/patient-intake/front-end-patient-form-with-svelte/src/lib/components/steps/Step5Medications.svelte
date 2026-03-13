<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
</script>

<SectionCard title="Current Medications" description="List all medications you currently take, including over-the-counter and supplements">
	<MedicationEntry bind:medications={assessment.data.medications} />
	{#if assessment.data.medications.length === 0}
		<p class="mt-3 text-sm text-gray-500">No medications added. Click the button above to add one, or proceed to next step if you take none.</p>
	{/if}
</SectionCard>
