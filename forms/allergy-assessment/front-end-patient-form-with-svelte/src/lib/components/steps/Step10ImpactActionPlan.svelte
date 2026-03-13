<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.impactActionPlan;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Impact & Action Plan" description="Quality of life, school/work impact, emergency action plan, and follow-up">
	<NumberInput label="Quality of life score (1 = very poor, 10 = excellent)" name="qol" bind:value={p.qualityOfLifeScore} min={1} max={10} step={1} />

	<RadioGroup label="Does your allergy impact school or work?" name="schoolWorkImpact" options={yesNo} bind:value={p.schoolWorkImpact} />
	{#if p.schoolWorkImpact === 'yes'}
		<TextArea label="School/work impact details" name="schoolWorkDetails" bind:value={p.schoolWorkImpactDetails} placeholder="Missed days, activity limitations, accommodations needed..." />
	{/if}

	<SelectInput
		label="Emergency action plan status"
		name="actionPlanStatus"
		options={[
			{ value: 'in-place', label: 'In place' },
			{ value: 'not-in-place', label: 'Not in place' },
			{ value: 'needs-update', label: 'Needs update' }
		]}
		bind:value={p.emergencyActionPlanStatus}
	/>

	<RadioGroup label="Has training been provided on allergy management?" name="trainingProvided" options={yesNo} bind:value={p.trainingProvided} />
	{#if p.trainingProvided === 'yes'}
		<TextInput label="Training details" name="trainingDetails" bind:value={p.trainingDetails} placeholder="e.g. EpiPen training, first aid course" />
	{/if}

	<TextInput label="Follow-up schedule" name="followUp" bind:value={p.followUpSchedule} placeholder="e.g. Annual allergy review, 6-monthly IgE monitoring" />
</SectionCard>
