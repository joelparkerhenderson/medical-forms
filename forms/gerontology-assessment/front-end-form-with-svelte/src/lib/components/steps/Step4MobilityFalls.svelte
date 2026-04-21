<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const m = assessment.data.mobilityFalls;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Mobility & Falls" description="Gait, balance, fall history, and mobility assessment">
	<SelectInput
		label="Gait Assessment"
		name="gaitAssessment"
		options={[
			{ value: 'normal', label: 'Normal gait' },
			{ value: 'unsteady', label: 'Unsteady gait' },
			{ value: 'unable', label: 'Unable to walk' }
		]}
		bind:value={m.gaitAssessment}
		required
	/>

	<SelectInput
		label="Balance Assessment"
		name="balanceAssessment"
		options={[
			{ value: 'normal', label: 'Normal balance' },
			{ value: 'impaired', label: 'Impaired balance' },
			{ value: 'severely-impaired', label: 'Severely impaired balance' }
		]}
		bind:value={m.balanceAssessment}
		required
	/>

	<RadioGroup label="Any falls in the past 12 months?" name="fallHistory" options={yesNo} bind:value={m.fallHistory} />
	{#if m.fallHistory === 'yes'}
		<NumberInput label="Number of falls in the past year" name="fallsLastYear" bind:value={m.fallsLastYear} min={0} max={100} required />
	{/if}

	<RadioGroup label="Do you have a fear of falling?" name="fearOfFalling" options={yesNo} bind:value={m.fearOfFalling} />

	<RadioGroup label="Do you use any mobility aids?" name="mobilityAids" options={yesNo} bind:value={m.mobilityAids} />
	{#if m.mobilityAids === 'yes'}
		<TextInput label="Type of mobility aid (e.g., walking stick, frame, wheelchair)" name="mobilityAidType" bind:value={m.mobilityAidType} />
	{/if}

	<NumberInput label="Timed Up and Go" name="timedUpAndGo" bind:value={m.timedUpAndGo} unit="seconds" min={0} max={300} step={0.1} />
</SectionCard>
