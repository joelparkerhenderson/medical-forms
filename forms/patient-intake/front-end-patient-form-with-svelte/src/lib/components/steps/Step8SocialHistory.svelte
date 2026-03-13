<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const s = assessment.data.socialHistory;
</script>

<SectionCard title="Social History" description="Lifestyle factors relevant to your health">
	<SelectInput
		label="Smoking status"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={s.smokingStatus}
	/>
	{#if s.smokingStatus === 'current' || s.smokingStatus === 'ex'}
		<NumberInput label="Pack years" name="packYears" bind:value={s.smokingPackYears} min={0} max={200} />
	{/if}

	<SelectInput
		label="Alcohol consumption"
		name="alcohol"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-7 units/week)' },
			{ value: 'moderate', label: 'Moderate (8-14 units/week)' },
			{ value: 'heavy', label: 'Heavy (>14 units/week)' }
		]}
		bind:value={s.alcoholFrequency}
	/>
	{#if s.alcoholFrequency && s.alcoholFrequency !== 'none'}
		<NumberInput label="Units per week" name="alcoholUnits" bind:value={s.alcoholUnitsPerWeek} min={0} max={200} />
	{/if}

	<SelectInput
		label="Recreational drug use"
		name="drugUse"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'regular', label: 'Regular' }
		]}
		bind:value={s.drugUse}
	/>
	{#if s.drugUse !== '' && s.drugUse !== 'none'}
		<TextInput label="Please provide details (substance, frequency)" name="drugDetails" bind:value={s.drugDetails} />
	{/if}

	<TextInput label="Occupation" name="occupation" bind:value={s.occupation} />

	<SelectInput
		label="Exercise frequency"
		name="exercise"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-2 times/week)' },
			{ value: 'moderate', label: 'Moderate (3-4 times/week)' },
			{ value: 'regular', label: 'Regular (5+ times/week)' }
		]}
		bind:value={s.exerciseFrequency}
	/>

	<SelectInput
		label="Diet quality"
		name="diet"
		options={[
			{ value: 'poor', label: 'Poor' },
			{ value: 'average', label: 'Average' },
			{ value: 'good', label: 'Good' },
			{ value: 'excellent', label: 'Excellent' }
		]}
		bind:value={s.dietQuality}
	/>
</SectionCard>
