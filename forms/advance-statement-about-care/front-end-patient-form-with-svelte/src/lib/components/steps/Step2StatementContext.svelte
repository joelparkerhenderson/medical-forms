<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.statementContext;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Statement Context" description="Help us understand why you are making this advance statement and when it should apply">
	<TextArea
		label="Why are you making this advance statement?"
		name="reasonForStatement"
		bind:value={s.reasonForStatement}
		placeholder="e.g. I have been diagnosed with a progressive condition and wish to record my preferences while I have capacity..."
		rows={4}
	/>

	<TextArea
		label="Current diagnosis or medical conditions"
		name="currentDiagnosis"
		bind:value={s.currentDiagnosis}
		placeholder="List any current medical conditions or diagnoses..."
		rows={3}
	/>

	<TextArea
		label="Your understanding of your condition"
		name="understandingOfCondition"
		bind:value={s.understandingOfCondition}
		placeholder="Describe what you understand about your condition and its likely progression..."
		rows={4}
	/>

	<TextArea
		label="When should this statement apply?"
		name="whenStatementShouldApply"
		bind:value={s.whenStatementShouldApply}
		placeholder="e.g. When I am no longer able to make decisions for myself, or when I can no longer communicate my wishes..."
		rows={4}
	/>

	<RadioGroup
		label="Have you made any previous advance statements?"
		name="previousStatements"
		options={yesNo}
		bind:value={s.previousAdvanceStatements}
	/>
	{#if s.previousAdvanceStatements === 'yes'}
		<TextArea
			label="Details of previous advance statements"
			name="previousStatementDetails"
			bind:value={s.previousStatementDetails}
			placeholder="Where are they held? This statement supersedes any previous versions."
			rows={3}
		/>
	{/if}
</SectionCard>
