<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateBMI, bmiCategory } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const bc = assessment.data.bodyComposition;

	const computedBMI = $derived(calculateBMI(bc.heightCm, bc.weightKg));
	const computedCategory = $derived(computedBMI !== null ? bmiCategory(computedBMI) : '');
</script>

<SectionCard title="Body Composition" description="Anthropometric measurements for eligibility assessment">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Height" name="heightCm" bind:value={bc.heightCm} min={50} max={250} step={0.1} unit="cm" required />
		<NumberInput label="Weight" name="weightKg" bind:value={bc.weightKg} min={20} max={300} step={0.1} unit="kg" required />
	</div>

	{#if computedBMI !== null}
		<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
			<div class="text-sm font-medium text-gray-700">Calculated BMI</div>
			<div class="text-2xl font-bold text-blue-800">{computedBMI.toFixed(1)}</div>
			<div class="text-sm text-blue-600">{computedCategory}</div>
		</div>
	{/if}

	<NumberInput label="Waist Circumference" name="waistCircumference" bind:value={bc.waistCircumference} min={40} max={200} step={0.1} unit="cm" />
	<NumberInput label="Body Fat Percentage" name="bodyFatPercent" bind:value={bc.bodyFatPercent} min={3} max={60} step={0.1} unit="%" />
	<NumberInput label="Previous Maximum Weight" name="previousMaxWeight" bind:value={bc.previousMaxWeight} min={20} max={400} step={0.1} unit="kg" />
</SectionCard>
