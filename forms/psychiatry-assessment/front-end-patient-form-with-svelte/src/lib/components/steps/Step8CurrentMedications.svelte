<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Antipsychotics, antidepressants, mood stabilizers, anxiolytics, and others">
	<MedicationEntry bind:medications={c.medications} />
	{#if c.medications.length === 0}
		<p class="mt-3 text-sm text-gray-500">No medications added. Click the button above to add one, or proceed to next step if the patient takes none.</p>
	{/if}

	<div class="mt-4">
		<TextArea label="Side Effects" name="sideEffects" bind:value={c.sideEffects} placeholder="Any reported side effects from current medications" />
	</div>

	<RadioGroup label="Is the patient compliant with medications?" name="compliance" options={yesNo} bind:value={c.compliance} />
	{#if c.compliance === 'no'}
		<TextArea label="Non-Compliance Details" name="complianceDetails" bind:value={c.complianceDetails} placeholder="Reasons for non-compliance, which medications affected" />
	{/if}
</SectionCard>
