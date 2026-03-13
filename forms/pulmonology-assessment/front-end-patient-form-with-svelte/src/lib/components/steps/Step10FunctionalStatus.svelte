<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const f = assessment.data.functionalStatus;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Functional Status" description="Exercise capacity and daily living assessment">
	<SelectInput
		label="Exercise tolerance"
		name="exerciseTolerance"
		options={[
			{ value: 'unable', label: 'Unable to exercise' },
			{ value: 'light-housework', label: 'Light housework only' },
			{ value: 'climb-stairs', label: 'Can climb stairs' },
			{ value: 'moderate-exercise', label: 'Moderate exercise' },
			{ value: 'vigorous-exercise', label: 'Vigorous exercise' }
		]}
		bind:value={f.exerciseTolerance}
	/>

	<NumberInput label="6-Minute Walk Test distance" name="sixMWT" bind:value={f.sixMinuteWalkDistance} unit="metres" min={0} max={1000} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Resting SpO2" name="spo2Rest" bind:value={f.oxygenSaturationRest} unit="%" min={50} max={100} />
		<NumberInput label="SpO2 on exertion" name="spo2Exertion" bind:value={f.oxygenSaturationExertion} unit="%" min={50} max={100} />
	</div>

	<RadioGroup label="Do you have limitations in activities of daily living (ADLs)?" name="adl" options={yesNo} bind:value={f.adlLimitations} />
	{#if f.adlLimitations === 'yes'}
		<TextArea label="Please describe your ADL limitations" name="adlDetails" bind:value={f.adlDetails} placeholder="e.g., difficulty dressing, bathing, cooking..." />
	{/if}
</SectionCard>
