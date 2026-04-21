<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.cardiovascular;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiovascular" description="Heart and blood vessel conditions">
	<RadioGroup label="Do you have high blood pressure (hypertension)?" name="htn" options={yesNo} bind:value={c.hypertension} />
	{#if c.hypertension === 'yes'}
		<RadioGroup label="Is it well controlled with medication?" name="htnCtrl" options={yesNo} bind:value={c.hypertensionControlled} required />
	{/if}

	<RadioGroup label="Do you have ischaemic heart disease (angina, previous heart attack)?" name="ihd" options={yesNo} bind:value={c.ischemicHeartDisease} />
	{#if c.ischemicHeartDisease === 'yes'}
		<TextInput label="Please provide details" name="ihdDetails" bind:value={c.ihdDetails} />
	{/if}

	<RadioGroup label="Do you have heart failure?" name="hf" options={yesNo} bind:value={c.heartFailure} />
	{#if c.heartFailure === 'yes'}
		<SelectInput
			label="NYHA Class"
			name="nyha"
			options={[
				{ value: '1', label: 'Class I - No limitation' },
				{ value: '2', label: 'Class II - Mild limitation' },
				{ value: '3', label: 'Class III - Marked limitation' },
				{ value: '4', label: 'Class IV - Severe limitation' }
			]}
			bind:value={c.heartFailureNYHA}
			required
		/>
	{/if}

	<RadioGroup label="Do you have any heart valve problems?" name="valve" options={yesNo} bind:value={c.valvularDisease} />
	{#if c.valvularDisease === 'yes'}
		<TextInput label="Please provide details" name="valveDetails" bind:value={c.valvularDetails} />
	{/if}

	<RadioGroup label="Do you have an irregular heartbeat (arrhythmia)?" name="arrhy" options={yesNo} bind:value={c.arrhythmia} />
	{#if c.arrhythmia === 'yes'}
		<TextInput label="Type of arrhythmia" name="arrhyType" bind:value={c.arrhythmiaType} />
	{/if}

	<RadioGroup label="Do you have a pacemaker or defibrillator?" name="pacemaker" options={yesNo} bind:value={c.pacemaker} />

	<RadioGroup label="Have you had a heart attack in the last 6 months?" name="recentMI" options={yesNo} bind:value={c.recentMI} />
	{#if c.recentMI === 'yes'}
		<NumberInput label="How many weeks ago?" name="miWeeks" bind:value={c.recentMIWeeks} min={0} max={26} required />
	{/if}
</SectionCard>
