<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const f = assessment.data.functionalImpact;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Functional Impact" description="How your vision affects daily activities">
	<SelectInput
		label="Driving status"
		name="drivingStatus"
		options={[
			{ value: 'current-driver', label: 'Current driver' },
			{ value: 'ceased-driving', label: 'Ceased driving (vision-related)' },
			{ value: 'never-driven', label: 'Never driven' }
		]}
		bind:value={f.drivingStatus}
	/>
	{#if f.drivingStatus === 'ceased-driving'}
		<TextArea label="Driving concerns" name="drivingConcerns" bind:value={f.drivingConcerns} />
	{/if}

	<SelectInput
		label="Reading ability"
		name="readingAbility"
		options={[
			{ value: 'no-difficulty', label: 'No difficulty' },
			{ value: 'mild-difficulty', label: 'Mild difficulty' },
			{ value: 'moderate-difficulty', label: 'Moderate difficulty' },
			{ value: 'severe-difficulty', label: 'Severe difficulty' },
			{ value: 'unable', label: 'Unable to read' }
		]}
		bind:value={f.readingAbility}
	/>

	<RadioGroup label="Any limitations in activities of daily living (ADL) due to vision?" name="adl" options={yesNo} bind:value={f.adlLimitations} />
	{#if f.adlLimitations === 'yes'}
		<TextArea label="Please describe limitations" name="adlDetails" bind:value={f.adlLimitationDetails} />
	{/if}

	<RadioGroup label="Have you had falls or near-falls related to your vision?" name="falls" options={yesNo} bind:value={f.fallsRisk} />
	{#if f.fallsRisk === 'yes'}
		<TextArea label="Falls details" name="fallsDetails" bind:value={f.fallsDetails} />
	{/if}

	<RadioGroup label="Do you need additional support services for your vision?" name="support" options={yesNo} bind:value={f.supportNeeds} />
	{#if f.supportNeeds === 'yes'}
		<TextArea label="Support needs details" name="supportDetails" bind:value={f.supportDetails} />
	{/if}
</SectionCard>
