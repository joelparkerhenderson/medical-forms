<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ch = assessment.data.childhoodHistory;
</script>

<SectionCard title="Childhood History" description="ADHD must have symptoms present before age 12 (DSM-5 criterion B). Please provide information about your childhood.">
	<RadioGroup
		label="Did you experience symptoms of inattention, hyperactivity, or impulsivity as a child?"
		name="childhoodSymptoms"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={ch.childhoodSymptoms}
		required
	/>

	{#if ch.childhoodSymptoms === 'yes'}
		<TextArea
			label="Describe your childhood symptoms"
			name="childhoodSymptomsDetails"
			bind:value={ch.childhoodSymptomsDetails}
			placeholder="e.g., difficulty paying attention in class, couldn't sit still, lost things frequently..."
		/>
	{/if}

	<SelectInput
		label="How would you describe your overall school performance?"
		name="schoolPerformance"
		options={[
			{ value: 'above-average', label: 'Above average' },
			{ value: 'average', label: 'Average' },
			{ value: 'below-average', label: 'Below average' },
			{ value: 'failing', label: 'Failing / significant difficulties' }
		]}
		bind:value={ch.schoolPerformance}
	/>

	<RadioGroup
		label="Were there any behavioural reports from teachers or school?"
		name="behaviouralReports"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={ch.behaviouralReports}
	/>

	{#if ch.behaviouralReports === 'yes'}
		<TextArea
			label="Describe the behavioural reports"
			name="behaviouralReportsDetails"
			bind:value={ch.behaviouralReportsDetails}
			placeholder="e.g., 'doesn't pay attention', 'disruptive in class', 'daydreams'..."
		/>
	{/if}

	<RadioGroup
		label="Did these symptoms begin before age 12?"
		name="onsetBeforeAge12"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No / Unsure' }
		]}
		bind:value={ch.onsetBeforeAge12}
		required
	/>
</SectionCard>
