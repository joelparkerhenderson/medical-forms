<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const mh = assessment.data.mentalHealthScreening;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Mental Health Screening" description="These questions help assess suitability for weight management medication. All responses are confidential.">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
		Your mental wellbeing is important. Please answer honestly - there are no wrong answers, and your responses help us provide safe, appropriate care.
	</div>

	<RadioGroup
		label="Do you have a history of an eating disorder (e.g., anorexia nervosa, bulimia nervosa, binge eating disorder)?"
		name="eatingDisorderHistory"
		options={yesNoOptions}
		bind:value={mh.eatingDisorderHistory}
	/>

	{#if mh.eatingDisorderHistory === 'yes'}
		<TextArea
			label="Please provide details about your eating disorder history"
			name="eatingDisorderDetails"
			bind:value={mh.eatingDisorderDetails}
			placeholder="Type, duration, treatment received..."
		/>
	{/if}

	<RadioGroup
		label="Do you have a history of depression?"
		name="depressionHistory"
		options={yesNoOptions}
		bind:value={mh.depressionHistory}
	/>

	<RadioGroup
		label="Are you currently experiencing thoughts of self-harm or suicide?"
		name="suicidalIdeation"
		options={yesNoOptions}
		bind:value={mh.suicidalIdeation}
	/>

	{#if mh.suicidalIdeation === 'yes'}
		<div class="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
			If you are in immediate danger, please contact emergency services (999) or the Samaritans (116 123). Your safety is the priority.
		</div>
	{/if}

	<RadioGroup
		label="Do you experience body dysmorphia (persistent distress about perceived flaws in physical appearance)?"
		name="bodyDysmorphia"
		options={yesNoOptions}
		bind:value={mh.bodyDysmorphia}
	/>

	<RadioGroup
		label="Do you have a history of binge drinking or alcohol misuse?"
		name="bingeDrinkingHistory"
		options={yesNoOptions}
		bind:value={mh.bingeDrinkingHistory}
	/>

	<TextArea
		label="Current Mental Health Treatment"
		name="currentMentalHealthTreatment"
		bind:value={mh.currentMentalHealthTreatment}
		placeholder="e.g., counselling, CBT, psychiatric medication..."
	/>
</SectionCard>
