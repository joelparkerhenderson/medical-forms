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

<SectionCard title="Medical History" description="Important medical conditions that may affect ADHD treatment, especially cardiovascular screening for stimulant safety.">
	<RadioGroup
		label="Any cardiovascular issues? (hypertension, heart defects, arrhythmia, chest pain)"
		name="cardiovascularIssues"
		options={yesNoOptions}
		bind:value={mh.cardiovascularIssues}
		required
	/>
	{#if mh.cardiovascularIssues === 'yes'}
		<TextArea label="Cardiovascular details" name="cardiovascularDetails" bind:value={mh.cardiovascularDetails} placeholder="Condition, treatment, current status..." />
	{/if}

	<RadioGroup
		label="Seizure history?"
		name="seizureHistory"
		options={yesNoOptions}
		bind:value={mh.seizureHistory}
		required
	/>
	{#if mh.seizureHistory === 'yes'}
		<TextArea label="Seizure details" name="seizureDetails" bind:value={mh.seizureDetails} placeholder="Type, frequency, medication..." />
	{/if}

	<RadioGroup
		label="Tic disorder (motor or vocal tics, Tourette syndrome)?"
		name="ticDisorder"
		options={yesNoOptions}
		bind:value={mh.ticDisorder}
		required
	/>
	{#if mh.ticDisorder === 'yes'}
		<TextArea label="Tic disorder details" name="ticDetails" bind:value={mh.ticDetails} placeholder="Type, severity, onset..." />
	{/if}

	<RadioGroup
		label="Thyroid disease?"
		name="thyroidDisease"
		options={yesNoOptions}
		bind:value={mh.thyroidDisease}
	/>
	{#if mh.thyroidDisease === 'yes'}
		<TextArea label="Thyroid details" name="thyroidDetails" bind:value={mh.thyroidDetails} placeholder="Type, treatment..." />
	{/if}

	<RadioGroup
		label="Head injuries or traumatic brain injury?"
		name="headInjuries"
		options={yesNoOptions}
		bind:value={mh.headInjuries}
	/>
	{#if mh.headInjuries === 'yes'}
		<TextArea label="Head injury details" name="headInjuryDetails" bind:value={mh.headInjuryDetails} placeholder="When, severity, symptoms..." />
	{/if}
</SectionCard>
