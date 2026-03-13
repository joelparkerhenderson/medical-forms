<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ig = assessment.data.indicationGoals;
</script>

<SectionCard title="Indication & Goals" description="Primary reason for considering semaglutide therapy and treatment objectives">
	<RadioGroup
		label="Primary Indication"
		name="primaryIndication"
		options={[
			{ value: 'type2-diabetes', label: 'Type 2 Diabetes' },
			{ value: 'weight-management', label: 'Weight Management' },
			{ value: 'cardiovascular-risk-reduction', label: 'Cardiovascular Risk Reduction' }
		]}
		bind:value={ig.primaryIndication}
		required
	/>

	<NumberInput
		label="Target Weight Loss"
		name="weightLossGoalPercent"
		bind:value={ig.weightLossGoalPercent}
		min={0}
		max={30}
		step={1}
		unit="% of body weight"
	/>

	<TextArea
		label="Previous Weight Loss Attempts"
		name="previousWeightLossAttempts"
		bind:value={ig.previousWeightLossAttempts}
		placeholder="e.g., diet programmes, exercise regimens, previous medications..."
	/>

	<RadioGroup
		label="Motivation Level"
		name="motivationLevel"
		options={[
			{ value: 'low', label: 'Low' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'high', label: 'High' }
		]}
		bind:value={ig.motivationLevel}
	/>
</SectionCard>
