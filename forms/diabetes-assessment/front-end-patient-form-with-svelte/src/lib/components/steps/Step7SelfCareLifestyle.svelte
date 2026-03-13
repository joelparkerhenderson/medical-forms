<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import LikertGroup from '$lib/components/ui/LikertGroup.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.selfCareLifestyle;
</script>

<SectionCard title="Self-Care & Lifestyle" description="Assess diet, exercise, and self-management behaviours.">
	<LikertGroup
		label="Diet Adherence (following recommended dietary plan)"
		name="dietAdherence"
		bind:value={d.dietAdherence}
		options={[
			{ value: 1, label: 'Very Poor' },
			{ value: 2, label: 'Poor' },
			{ value: 3, label: 'Fair' },
			{ value: 4, label: 'Good' },
			{ value: 5, label: 'Excellent' }
		]}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Carbohydrate Counting"
			name="carbCounting"
			bind:value={d.carbCounting}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<SelectInput
			label="Physical Activity Level"
			name="physicalActivity"
			bind:value={d.physicalActivity}
			options={[
				{ value: 'sedentary', label: 'Sedentary' },
				{ value: 'minimal', label: 'Minimal (light activity)' },
				{ value: 'moderate', label: 'Moderate (some regular exercise)' },
				{ value: 'regular', label: 'Regular (150+ min/week)' },
				{ value: 'veryActive', label: 'Very Active' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="BMI (kg/m2)" name="bmi" bind:value={d.bmi} step="0.1" min={10} max={80} placeholder="e.g. 28.5" />
		<SelectInput
			label="Recent Weight Change"
			name="weightChange"
			bind:value={d.weightChange}
			options={[
				{ value: 'stable', label: 'Stable' },
				{ value: 'gained', label: 'Weight Gain' },
				{ value: 'lost', label: 'Weight Loss' },
				{ value: 'significantGain', label: 'Significant Gain (>5kg)' },
				{ value: 'significantLoss', label: 'Significant Loss (>5kg)' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Alcohol Consumption"
			name="alcoholConsumption"
			bind:value={d.alcoholConsumption}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'withinLimits', label: 'Within Recommended Limits' },
				{ value: 'aboveLimits', label: 'Above Recommended Limits' },
				{ value: 'excessive', label: 'Excessive' }
			]}
		/>
		<SelectInput
			label="Smoking Cessation Support"
			name="smokingCessation"
			bind:value={d.smokingCessation}
			options={[
				{ value: 'notApplicable', label: 'Not Applicable (non-smoker)' },
				{ value: 'offered', label: 'Offered' },
				{ value: 'declined', label: 'Declined' },
				{ value: 'ongoing', label: 'Ongoing Programme' }
			]}
		/>
	</div>
</SectionCard>
