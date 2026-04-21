<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { percentileCategory } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const g = assessment.data.growthNutrition;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Growth & Nutrition" description="Growth percentiles and feeding information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<div>
			<NumberInput label="Weight Percentile" name="weightPct" bind:value={g.weightPercentile} min={0} max={100} step={1} />
			{#if g.weightPercentile !== null}
				<p class="mt-[-12px] mb-4 text-xs text-gray-500">{percentileCategory(g.weightPercentile)}</p>
			{/if}
		</div>
		<div>
			<NumberInput label="Height Percentile" name="heightPct" bind:value={g.heightPercentile} min={0} max={100} step={1} />
			{#if g.heightPercentile !== null}
				<p class="mt-[-12px] mb-4 text-xs text-gray-500">{percentileCategory(g.heightPercentile)}</p>
			{/if}
		</div>
		<div>
			<NumberInput label="Head Circ. Percentile" name="headPct" bind:value={g.headCircumferencePercentile} min={0} max={100} step={1} />
			{#if g.headCircumferencePercentile !== null}
				<p class="mt-[-12px] mb-4 text-xs text-gray-500">{percentileCategory(g.headCircumferencePercentile)}</p>
			{/if}
		</div>
	</div>

	<SelectInput
		label="Feeding Type"
		name="feedingType"
		options={[
			{ value: 'breast', label: 'Breastfed' },
			{ value: 'formula', label: 'Formula Fed' },
			{ value: 'mixed', label: 'Mixed Feeding' },
			{ value: 'solid', label: 'Solid Foods' }
		]}
		bind:value={g.feedingType}
	/>

	<RadioGroup label="Are there any dietary concerns?" name="dietConcerns" options={yesNo} bind:value={g.dietaryConcerns} />
	{#if g.dietaryConcerns === 'yes'}
		<TextArea label="Please describe dietary concerns" name="dietConcernDetails" bind:value={g.dietaryConcernDetails} />
	{/if}

	<RadioGroup label="Has failure to thrive been identified?" name="ftt" options={yesNo} bind:value={g.failureToThrive} />
</SectionCard>
