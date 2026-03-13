<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ss = assessment.data.socialSupport;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Social & Support" description="Family history, support systems, and previous assessments">
	<RadioGroup
		label="Do any family members have ADHD (diagnosed or suspected)?"
		name="familyHistoryADHD"
		options={yesNoOptions}
		bind:value={ss.familyHistoryADHD}
	/>
	{#if ss.familyHistoryADHD === 'yes'}
		<TextArea label="Family history details" name="familyHistoryDetails" bind:value={ss.familyHistoryDetails} placeholder="Which relatives, diagnosed or suspected..." />
	{/if}

	<TextArea
		label="What support systems do you currently have?"
		name="supportSystems"
		bind:value={ss.supportSystems}
		placeholder="e.g., family support, partner, workplace accommodations, therapy..."
	/>

	<TextArea
		label="What coping strategies do you use for attention/focus difficulties?"
		name="copingStrategies"
		bind:value={ss.copingStrategies}
		placeholder="e.g., lists, alarms, timers, apps, exercise, environment modifications..."
	/>

	<RadioGroup
		label="Have you had any previous ADHD assessments?"
		name="previousAssessments"
		options={yesNoOptions}
		bind:value={ss.previousAssessments}
	/>
	{#if ss.previousAssessments === 'yes'}
		<TextArea label="Previous assessment details" name="previousAssessmentDetails" bind:value={ss.previousAssessmentDetails} placeholder="When, where, outcome..." />
	{/if}

	<RadioGroup
		label="Have you received a previous ADHD diagnosis?"
		name="previousDiagnosis"
		options={yesNoOptions}
		bind:value={ss.previousDiagnosis}
	/>
	{#if ss.previousDiagnosis === 'yes'}
		<TextArea label="Previous diagnosis details" name="previousDiagnosisDetails" bind:value={ss.previousDiagnosisDetails} placeholder="When, by whom, subtype..." />
	{/if}
</SectionCard>
