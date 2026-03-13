<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const fn = assessment.data.functionalNutritional;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Functional & Nutritional" description="Detailed functional status and nutritional assessment">
	<SelectInput
		label="ECOG Performance Status (Detailed)"
		name="ecogDetailed"
		options={[
			{ value: '0', label: '0 - Fully active, able to carry on all pre-disease activities' },
			{ value: '1', label: '1 - Restricted in physically strenuous activity but ambulatory' },
			{ value: '2', label: '2 - Ambulatory and capable of all self-care but unable to carry out work activities; up and about >50% of waking hours' },
			{ value: '3', label: '3 - Capable of only limited self-care; confined to bed or chair >50% of waking hours' },
			{ value: '4', label: '4 - Completely disabled; cannot carry on any self-care; totally confined to bed or chair' }
		]}
		bind:value={fn.ecogDetailed}
	/>

	<NumberInput label="Karnofsky Performance Score" name="karnofsky" bind:value={fn.karnofskyScore} min={0} max={100} step={10} />
	<p class="mt-[-12px] mb-4 text-xs text-gray-500">0 = dead, 100 = normal, no complaints</p>

	<SelectInput
		label="Nutritional Status"
		name="nutritionalStatus"
		options={[
			{ value: 'well-nourished', label: 'Well nourished' },
			{ value: 'at-risk', label: 'At risk of malnutrition' },
			{ value: 'malnourished', label: 'Malnourished' }
		]}
		bind:value={fn.nutritionalStatus}
	/>

	<SelectInput
		label="Weight Trajectory"
		name="weightTrajectory"
		options={[
			{ value: 'stable', label: 'Stable' },
			{ value: 'increasing', label: 'Increasing' },
			{ value: 'decreasing-slowly', label: 'Decreasing slowly' },
			{ value: 'decreasing-rapidly', label: 'Decreasing rapidly' }
		]}
		bind:value={fn.weightTrajectory}
	/>

	<SelectInput
		label="Dietary Intake"
		name="dietaryIntake"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'reduced-mildly', label: 'Mildly reduced' },
			{ value: 'reduced-significantly', label: 'Significantly reduced' },
			{ value: 'minimal', label: 'Minimal' }
		]}
		bind:value={fn.dietaryIntake}
	/>

	<RadioGroup label="Nutritional support required?" name="nutritionalSupport" options={yesNo} bind:value={fn.nutritionalSupportRequired} />
</SectionCard>
