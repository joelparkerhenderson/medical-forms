<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import { calculateBMI } from '$lib/engine/utils';

	const d = assessment.data.bodyMeasurements;

	const autoBMI = $derived(
		d.bmi ?? calculateBMI(d.heightCm, d.weightKg)
	);

	function bmiCategory(bmi: number): string {
		if (bmi < 18.5) return 'Underweight';
		if (bmi < 25) return 'Normal';
		if (bmi < 30) return 'Overweight';
		if (bmi < 40) return 'Obese';
		return 'Morbidly Obese';
	}

	function bmiColor(bmi: number): string {
		if (bmi >= 18.5 && bmi < 25) return 'text-green-700 bg-green-50';
		if (bmi < 30) return 'text-yellow-700 bg-yellow-50';
		return 'text-red-700 bg-red-50';
	}
</script>

<SectionCard title="Body Measurements" description="Height, weight, and waist circumference">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Height" name="heightCm" bind:value={d.heightCm} min={100} max={250} step={0.1} unit="cm" />
		<NumberInput label="Weight" name="weightKg" bind:value={d.weightKg} min={30} max={300} step={0.1} unit="kg" />
	</div>
	{#if autoBMI != null}
		<div class="mb-4 rounded-lg p-3 text-sm {bmiColor(autoBMI)}">
			<span class="font-medium">BMI:</span>
			{autoBMI} ({bmiCategory(autoBMI)})
		</div>
	{/if}
	<NumberInput label="BMI (override)" name="bmi" bind:value={d.bmi} min={10} max={80} step={0.1} />
	<NumberInput label="Waist Circumference" name="waistCircumferenceCm" bind:value={d.waistCircumferenceCm} min={40} max={200} step={0.1} unit="cm" />
</SectionCard>
