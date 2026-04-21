<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const rf = assessment.data.riskFactors;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Risk Factors" description="Known stroke risk factors">
	<RadioGroup
		label="Hypertension"
		name="hypertension"
		options={yesNoOptions}
		bind:value={rf.hypertension}
	/>

	<RadioGroup
		label="Diabetes"
		name="diabetes"
		options={yesNoOptions}
		bind:value={rf.diabetes}
	/>

	<RadioGroup
		label="Atrial Fibrillation"
		name="atrialFibrillation"
		options={yesNoOptions}
		bind:value={rf.atrialFibrillation}
	/>

	<RadioGroup
		label="Previous Stroke or TIA"
		name="previousStroke"
		options={yesNoOptions}
		bind:value={rf.previousStroke}
	/>

	<RadioGroup
		label="Current Smoker"
		name="smoking"
		options={yesNoOptions}
		bind:value={rf.smoking}
	/>

	<RadioGroup
		label="Hyperlipidemia"
		name="hyperlipidemia"
		options={yesNoOptions}
		bind:value={rf.hyperlipidemia}
	/>

	<RadioGroup
		label="Family History of Stroke"
		name="familyHistory"
		options={yesNoOptions}
		bind:value={rf.familyHistory}
	/>
</SectionCard>
