<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.physicalActivityDiet;
</script>

<SectionCard title="Physical Activity & Diet" description="Exercise and dietary habits">
	<NumberInput label="Physical Activity" name="physicalActivityMinutesPerWeek" bind:value={d.physicalActivityMinutesPerWeek} min={0} max={2000} unit="minutes/week" />
	<SelectInput
		label="Activity Intensity"
		name="activityIntensity"
		bind:value={d.activityIntensity}
		options={[
			{ value: 'light', label: 'Light (walking, yoga)' },
			{ value: 'moderate', label: 'Moderate (brisk walking, cycling)' },
			{ value: 'vigorous', label: 'Vigorous (running, sports)' }
		]}
	/>
	<NumberInput label="Fruit & Vegetable Portions Per Day" name="fruitVegPortionsPerDay" bind:value={d.fruitVegPortionsPerDay} min={0} max={20} />
	<SelectInput
		label="Diet Quality"
		name="dietQuality"
		bind:value={d.dietQuality}
		options={[
			{ value: 'poor', label: 'Poor' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'good', label: 'Good' },
			{ value: 'excellent', label: 'Excellent' }
		]}
	/>
	<SelectInput
		label="Salt Intake"
		name="saltIntake"
		bind:value={d.saltIntake}
		options={[
			{ value: 'low', label: 'Low' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'high', label: 'High' }
		]}
	/>
</SectionCard>
