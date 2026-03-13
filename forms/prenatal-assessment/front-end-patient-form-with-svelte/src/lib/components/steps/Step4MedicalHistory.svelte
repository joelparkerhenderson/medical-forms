<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.medicalHistory;
	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Pre-existing conditions and chronic diseases">
	<TextArea
		label="Chronic Conditions"
		name="chronicConditions"
		bind:value={m.chronicConditions}
		placeholder="List any chronic conditions (e.g., asthma, epilepsy, kidney disease)..."
	/>

	<RadioGroup
		label="Autoimmune disease (e.g., lupus, rheumatoid arthritis)"
		name="autoimmune"
		options={yesNoOptions}
		bind:value={m.autoimmune}
	/>

	<RadioGroup
		label="Thyroid disorder (hypo- or hyperthyroidism)"
		name="thyroid"
		options={yesNoOptions}
		bind:value={m.thyroid}
	/>

	<RadioGroup
		label="Pre-existing diabetes (Type 1 or Type 2)"
		name="diabetes"
		options={yesNoOptions}
		bind:value={m.diabetes}
	/>

	<RadioGroup
		label="Pre-existing hypertension"
		name="hypertension"
		options={yesNoOptions}
		bind:value={m.hypertension}
	/>
</SectionCard>
