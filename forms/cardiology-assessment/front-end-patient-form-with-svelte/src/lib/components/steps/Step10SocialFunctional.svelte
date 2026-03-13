<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { estimateMETs } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const s = assessment.data.socialFunctional;

	$effect(() => {
		const mets = estimateMETs(s.exerciseTolerance);
		assessment.data.socialFunctional.estimatedMETs = mets;
	});
</script>

<SectionCard title="Social & Functional" description="Smoking, alcohol, exercise tolerance, and occupation">
	<SelectInput
		label="Smoking status"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={s.smoking}
	/>
	{#if s.smoking === 'current' || s.smoking === 'ex'}
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
		bind:value={s.alcohol}
	/>
	{#if s.alcohol !== 'none' && s.alcohol !== ''}
		<NumberInput label="Units per week" name="alcoholUnits" bind:value={s.alcoholUnitsPerWeek} min={0} max={200} />
	{/if}

	<SelectInput
		label="Exercise tolerance"
		name="exerciseTolerance"
		options={[
			{ value: 'unable', label: 'Unable to exercise' },
			{ value: 'light-housework', label: 'Light housework only' },
			{ value: 'climb-stairs', label: 'Can climb 1-2 flights of stairs' },
			{ value: 'moderate-exercise', label: 'Moderate exercise (brisk walking)' },
			{ value: 'vigorous-exercise', label: 'Vigorous exercise (running, swimming)' }
		]}
		bind:value={s.exerciseTolerance}
	/>

	{#if s.estimatedMETs !== null}
		<div class="mb-4">
			<span class="mb-1 block text-sm font-medium text-gray-700">Estimated METs</span>
			<div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">
				<span class="font-medium">{s.estimatedMETs} METs</span>
				{#if s.estimatedMETs < 4}
					<span class="ml-2 text-red-600">(Poor - below 4 METs threshold)</span>
				{:else}
					<span class="ml-2 text-green-600">(Adequate)</span>
				{/if}
			</div>
		</div>
	{/if}

	<TextInput label="Occupation" name="occupation" bind:value={s.occupation} placeholder="e.g. Retired, office worker, manual labour" />
</SectionCard>
