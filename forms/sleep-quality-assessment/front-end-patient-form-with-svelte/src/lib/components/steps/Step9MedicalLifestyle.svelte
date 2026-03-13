<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.medicalLifestyle;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical & Lifestyle Factors" description="Lifestyle habits and medical conditions that may affect sleep">
	<SelectInput
		label="Daily caffeine intake (coffee, tea, energy drinks)"
		name="caffeineIntake"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'low-1-2', label: 'Low (1-2 beverages/day)' },
			{ value: 'moderate-3-4', label: 'Moderate (3-4 beverages/day)' },
			{ value: 'high-5-plus', label: 'High (5 or more beverages/day)' }
		]}
		bind:value={m.caffeineIntake}
	/>

	<SelectInput
		label="Alcohol use"
		name="alcoholUse"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-2 drinks/week)' },
			{ value: 'moderate', label: 'Moderate (3-7 drinks/week)' },
			{ value: 'heavy', label: 'Heavy (8+ drinks/week)' }
		]}
		bind:value={m.alcoholUse}
	/>

	<SelectInput
		label="Exercise frequency"
		name="exerciseFrequency"
		options={[
			{ value: 'none', label: 'No regular exercise' },
			{ value: 'light-1-2', label: 'Light exercise (1-2 times/week)' },
			{ value: 'moderate-3-4', label: 'Moderate exercise (3-4 times/week)' },
			{ value: 'vigorous-5-plus', label: 'Vigorous exercise (5+ times/week)' }
		]}
		bind:value={m.exerciseFrequency}
	/>

	<SelectInput
		label="Screen time before bed (phone, tablet, computer, TV)"
		name="screenTimeBeforeBed"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'less-than-30-min', label: 'Less than 30 minutes' },
			{ value: '30-60-min', label: '30-60 minutes' },
			{ value: 'more-than-60-min', label: 'More than 60 minutes' }
		]}
		bind:value={m.screenTimeBeforeBed}
	/>

	<RadioGroup
		label="Do you work shifts (night shifts, rotating shifts)?"
		name="shiftWork"
		options={yesNo}
		bind:value={m.shiftWork}
	/>

	<TextArea
		label="Medical conditions that may affect sleep"
		name="medicalConditions"
		bind:value={m.medicalConditions}
		placeholder="e.g., chronic pain, GERD, depression, anxiety, restless legs..."
	/>

	<TextArea
		label="Current medications (that may affect sleep)"
		name="currentMedications"
		bind:value={m.currentMedications}
		placeholder="List any medications you are currently taking..."
	/>
</SectionCard>
