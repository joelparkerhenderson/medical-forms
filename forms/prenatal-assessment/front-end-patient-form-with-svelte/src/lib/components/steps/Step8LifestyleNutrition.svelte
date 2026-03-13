<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const l = assessment.data.lifestyleNutrition;
	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Lifestyle & Nutrition" description="Lifestyle factors and nutritional status">
	<RadioGroup
		label="Smoking during this pregnancy"
		name="smoking"
		options={yesNoOptions}
		bind:value={l.smoking}
	/>

	<RadioGroup
		label="Alcohol consumption during this pregnancy"
		name="alcohol"
		options={yesNoOptions}
		bind:value={l.alcohol}
	/>

	<RadioGroup
		label="Recreational drug use during this pregnancy"
		name="drugs"
		options={yesNoOptions}
		bind:value={l.drugs}
	/>

	<SelectInput
		label="Exercise Level"
		name="exercise"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'light', label: 'Light (walking, gentle stretching)' },
			{ value: 'moderate', label: 'Moderate (swimming, prenatal yoga)' },
			{ value: 'vigorous', label: 'Vigorous (running, high-intensity)' }
		]}
		bind:value={l.exercise}
	/>

	<SelectInput
		label="Diet Quality"
		name="diet"
		options={[
			{ value: 'poor', label: 'Poor' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'good', label: 'Good' },
			{ value: 'excellent', label: 'Excellent' }
		]}
		bind:value={l.diet}
	/>

	<TextArea
		label="Current Supplements"
		name="supplements"
		bind:value={l.supplements}
		placeholder="e.g., Prenatal vitamins, iron, calcium, vitamin D..."
	/>

	<RadioGroup
		label="Taking folic acid"
		name="folicAcid"
		options={yesNoOptions}
		bind:value={l.folicAcid}
	/>
</SectionCard>
