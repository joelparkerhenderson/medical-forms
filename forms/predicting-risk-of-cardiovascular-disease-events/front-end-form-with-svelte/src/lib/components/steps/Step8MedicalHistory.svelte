<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const mh = assessment.data.medicalHistory;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Existing cardiovascular conditions and family history">
	<RadioGroup
		label="Has known cardiovascular disease?"
		name="hasKnownCvd"
		options={yesNoOptions}
		bind:value={mh.hasKnownCvd}
		required
	/>

	{#if mh.hasKnownCvd === 'yes'}
		<div class="ml-4 border-l-2 border-blue-200 pl-4">
			<RadioGroup label="Previous myocardial infarction (MI)?" name="previousMi" options={yesNoOptions} bind:value={mh.previousMi} />
			<RadioGroup label="Previous stroke?" name="previousStroke" options={yesNoOptions} bind:value={mh.previousStroke} />
			<RadioGroup label="Heart failure?" name="heartFailure" options={yesNoOptions} bind:value={mh.heartFailure} />
			<RadioGroup label="Peripheral arterial disease?" name="peripheralArterialDisease" options={yesNoOptions} bind:value={mh.peripheralArterialDisease} />
		</div>
	{/if}

	<RadioGroup
		label="Atrial fibrillation?"
		name="atrialFibrillation"
		options={yesNoOptions}
		bind:value={mh.atrialFibrillation}
	/>

	<RadioGroup
		label="Family history of premature CVD?"
		name="familyCvdHistory"
		options={yesNoOptions}
		bind:value={mh.familyCvdHistory}
	/>

	{#if mh.familyCvdHistory === 'yes'}
		<TextArea
			label="Family CVD Details"
			name="familyCvdDetails"
			bind:value={mh.familyCvdDetails}
			placeholder="Please describe affected family members and conditions"
		/>
	{/if}
</SectionCard>
