<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import { isSmoker } from '$lib/engine/utils';

	const d = assessment.data.smokingAlcohol;

	const showCigarettes = $derived(isSmoker(d.smokingStatus));
	const showYearsSinceQuit = $derived(d.smokingStatus === 'exSmoker');
</script>

<SectionCard title="Smoking & Alcohol" description="Tobacco and alcohol consumption">
	<SelectInput
		label="Smoking Status"
		name="smokingStatus"
		bind:value={d.smokingStatus}
		options={[
			{ value: 'nonSmoker', label: 'Non-smoker (never smoked)' },
			{ value: 'exSmoker', label: 'Ex-smoker' },
			{ value: 'lightSmoker', label: 'Light smoker (1-9/day)' },
			{ value: 'moderateSmoker', label: 'Moderate smoker (10-19/day)' },
			{ value: 'heavySmoker', label: 'Heavy smoker (20+/day)' }
		]}
	/>
	{#if showCigarettes}
		<NumberInput label="Cigarettes Per Day" name="cigarettesPerDay" bind:value={d.cigarettesPerDay} min={1} max={100} />
	{/if}
	{#if showYearsSinceQuit}
		<NumberInput label="Years Since Quitting" name="yearsSinceQuit" bind:value={d.yearsSinceQuit} min={0} max={80} unit="years" />
	{/if}
	<NumberInput label="Alcohol Units Per Week" name="alcoholUnitsPerWeek" bind:value={d.alcoholUnitsPerWeek} min={0} max={200} step={0.5} unit="units/week" />
	<SelectInput
		label="Alcohol Frequency"
		name="alcoholFrequency"
		bind:value={d.alcoholFrequency}
		options={[
			{ value: 'never', label: 'Never' },
			{ value: 'monthly', label: 'Monthly or less' },
			{ value: 'twoToFourPerMonth', label: '2-4 times per month' },
			{ value: 'twoToThreePerWeek', label: '2-3 times per week' },
			{ value: 'fourOrMorePerWeek', label: '4+ times per week' }
		]}
	/>
</SectionCard>
