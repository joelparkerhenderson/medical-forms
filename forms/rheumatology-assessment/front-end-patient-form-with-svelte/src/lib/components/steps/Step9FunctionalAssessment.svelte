<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.functionalAssessment;
</script>

<SectionCard title="Functional Assessment" description="Functional capacity and disability evaluation">
	<NumberInput
		label="HAQ-DI Score"
		name="haqDiScore"
		bind:value={d.haqDiScore}
		min={0}
		max={3}
		step={0.1}
	/>
	<p class="mb-4 -mt-2 text-xs text-gray-500">Health Assessment Questionnaire Disability Index (0 = no disability, 3 = maximum disability)</p>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Grip Strength Left"
			name="gripStrengthLeft"
			bind:value={d.gripStrengthLeft}
			unit="kg"
			min={0}
			max={100}
		/>
		<NumberInput
			label="Grip Strength Right"
			name="gripStrengthRight"
			bind:value={d.gripStrengthRight}
			unit="kg"
			min={0}
			max={100}
		/>
	</div>

	<SelectInput
		label="Walking Ability"
		name="walkingAbility"
		options={[
			{ value: 'independent', label: 'Independent' },
			{ value: 'with-aid', label: 'With Walking Aid' },
			{ value: 'wheelchair', label: 'Wheelchair' },
			{ value: 'bedbound', label: 'Bedbound' }
		]}
		bind:value={d.walkingAbility}
	/>

	<TextArea
		label="ADL Limitations"
		name="adlLimitations"
		bind:value={d.adlLimitations}
		placeholder="Describe limitations in activities of daily living..."
	/>

	<RadioGroup
		label="Work Disability"
		name="workDisability"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={d.workDisability}
	/>

	{#if d.workDisability === 'yes'}
		<TextArea
			label="Work Disability Details"
			name="workDisabilityDetails"
			bind:value={d.workDisabilityDetails}
			placeholder="Type of work disability, duration, impact..."
		/>
	{/if}
</SectionCard>
