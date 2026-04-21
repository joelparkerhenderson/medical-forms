<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const t = assessment.data.triggersPatterns;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Triggers & Patterns" description="Identify factors that trigger or worsen your symptoms">
	<TextArea
		label="Food triggers"
		name="foodTriggers"
		bind:value={t.foodTriggers}
		placeholder="e.g., alcohol, aged cheese, fermented foods, histamine-rich foods, additives..."
	/>

	<TextArea
		label="Environmental triggers"
		name="environmentalTriggers"
		bind:value={t.environmentalTriggers}
		placeholder="e.g., heat, cold, fragrances, chemicals, pollen, mould..."
	/>

	<RadioGroup
		label="Does emotional stress trigger or worsen your symptoms?"
		name="stressTriggers"
		options={yesNo}
		bind:value={t.stressTriggers}
	/>

	<RadioGroup
		label="Does physical exercise trigger or worsen your symptoms?"
		name="exerciseTrigger"
		options={yesNo}
		bind:value={t.exerciseTrigger}
	/>

	<RadioGroup
		label="Do temperature changes trigger or worsen your symptoms?"
		name="temperatureTrigger"
		options={yesNo}
		bind:value={t.temperatureTrigger}
	/>

	<TextArea
		label="Medication triggers"
		name="medicationTriggers"
		bind:value={t.medicationTriggers}
		placeholder="e.g., NSAIDs, opioids, antibiotics, contrast dyes, anaesthetics..."
	/>
</SectionCard>
