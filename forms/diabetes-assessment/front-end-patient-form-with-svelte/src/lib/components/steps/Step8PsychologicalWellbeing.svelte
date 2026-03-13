<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import LikertGroup from '$lib/components/ui/LikertGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.psychologicalWellbeing;
</script>

<SectionCard title="Psychological Wellbeing" description="Assess psychological impact of diabetes and support needs.">
	<LikertGroup
		label="Diabetes Distress (how bothered are you by managing diabetes?)"
		name="diabetesDistress"
		bind:value={d.diabetesDistress}
		options={[
			{ value: 1, label: 'Not at all' },
			{ value: 2, label: 'A little' },
			{ value: 3, label: 'Moderate' },
			{ value: 4, label: 'Quite a bit' },
			{ value: 5, label: 'Very much' }
		]}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Depression Screening (PHQ-2 score, 0-6)" name="depressionScreening" bind:value={d.depressionScreening} min={0} max={10} placeholder="e.g. 2" />
		<NumberInput label="Anxiety Screening (GAD-2 score, 0-6)" name="anxietyScreening" bind:value={d.anxietyScreening} min={0} max={10} placeholder="e.g. 1" />
	</div>

	<RadioGroup
		label="Eating Disorder Concerns"
		name="eatingDisorder"
		bind:value={d.eatingDisorder}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>

	<LikertGroup
		label="Fear of Hypoglycaemia"
		name="fearOfHypoglycaemia"
		bind:value={d.fearOfHypoglycaemia}
		options={[
			{ value: 1, label: 'None' },
			{ value: 2, label: 'Mild' },
			{ value: 3, label: 'Moderate' },
			{ value: 4, label: 'Significant' },
			{ value: 5, label: 'Severe' }
		]}
	/>

	<LikertGroup
		label="Coping Ability (how well are you managing living with diabetes?)"
		name="copingAbility"
		bind:value={d.copingAbility}
		options={[
			{ value: 1, label: 'Very Poor' },
			{ value: 2, label: 'Poor' },
			{ value: 3, label: 'Fair' },
			{ value: 4, label: 'Good' },
			{ value: 5, label: 'Very Good' }
		]}
	/>

	<RadioGroup
		label="Needs Psychological Support"
		name="needsSupport"
		bind:value={d.needsSupport}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
</SectionCard>
