<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="HRT history and other medications">
	<RadioGroup label="Are you currently taking HRT?" name="currentHRT" options={yesNo} bind:value={m.currentHRT} />
	{#if m.currentHRT === 'yes'}
		<TextInput label="Current HRT details (name, type, dose)" name="currentHRTDetails" bind:value={m.currentHRTDetails} />
		<TextInput label="How long have you been on current HRT?" name="currentHRTDuration" bind:value={m.currentHRTDuration} placeholder="e.g., 6 months, 2 years" />
	{/if}

	<RadioGroup label="Have you previously taken HRT?" name="previousHRT" options={yesNo} bind:value={m.previousHRT} />
	{#if m.previousHRT === 'yes'}
		<TextInput label="Previous HRT details" name="previousHRTDetails" bind:value={m.previousHRTDetails} />
		<TextInput label="Reason for stopping" name="previousHRTReason" bind:value={m.previousHRTReason} placeholder="e.g., side effects, completed course, clinical advice" />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-700">Other Medications</h3>
	<MedicationEntry bind:medications={m.otherMedications} />
	{#if m.otherMedications.length === 0}
		<p class="mt-3 text-sm text-gray-500">No other medications added. Click the button above to add one, or proceed to next step if you take none.</p>
	{/if}

	<TextArea label="Supplements (vitamins, herbal remedies, etc.)" name="supplements" bind:value={m.supplements} placeholder="e.g., vitamin D, calcium, evening primrose oil, black cohosh..." />
</SectionCard>
