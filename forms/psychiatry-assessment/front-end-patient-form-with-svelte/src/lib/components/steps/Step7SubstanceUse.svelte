<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.substanceUse;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Substance Use" description="Alcohol, drugs, tobacco, and gambling assessment">
	<NumberInput label="AUDIT Score (Alcohol Use Disorders Identification Test)" name="audit" bind:value={s.alcoholAuditScore} min={0} max={40} />
	<p class="mb-4 -mt-2 text-xs text-gray-500">0-7 low risk, 8-15 hazardous, 16-19 harmful, 20-40 possible dependence</p>

	<SelectInput
		label="Alcohol Frequency"
		name="alcoholFreq"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'regular', label: 'Regular' },
			{ value: 'daily', label: 'Daily' },
			{ value: 'dependent', label: 'Dependent' }
		]}
		bind:value={s.alcoholFrequency}
	/>

	<RadioGroup label="Illicit drug use?" name="drugUse" options={yesNo} bind:value={s.drugUse} />
	{#if s.drugUse === 'yes'}
		<TextArea label="Drug Use Details" name="drugDetails" bind:value={s.drugDetails} placeholder="Substance(s), route, frequency, last use" />
	{/if}

	<RadioGroup label="Tobacco use?" name="tobacco" options={yesNo} bind:value={s.tobaccoUse} />
	{#if s.tobaccoUse === 'yes'}
		<TextArea label="Tobacco Details" name="tobaccoDetails" bind:value={s.tobaccoDetails} placeholder="Type, amount, duration" />
	{/if}

	<RadioGroup label="Problem gambling?" name="gambling" options={yesNo} bind:value={s.gamblingProblem} />

	<RadioGroup label="Withdrawal risk?" name="withdrawal" options={yesNo} bind:value={s.withdrawalRisk} />
	{#if s.withdrawalRisk === 'yes'}
		<TextArea label="Withdrawal Risk Details" name="withdrawalDetails" bind:value={s.withdrawalDetails} placeholder="Expected withdrawal symptoms, timeline, severity" />
	{/if}
</SectionCard>
