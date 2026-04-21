<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.clinicalReview;
</script>

<SectionCard title="Clinical Review" description="Provide the clinical summary, diagnosis, and follow-up plan">
	<TextArea label="Clinical Summary" name="clinicalSummary" rows={4} bind:value={d.clinicalSummary} placeholder="Summarise key clinical findings and their significance" />
	<TextArea label="Diagnosis" name="diagnosis" rows={2} bind:value={d.diagnosis} placeholder="e.g. Iron deficiency anemia, chronic disease" />
	<TextArea label="Follow-up Plan" name="followUpPlan" bind:value={d.followUpPlan} placeholder="e.g. Repeat CBC in 4 weeks, iron studies in 3 months" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Urgency Level (1-5)"
			name="urgencyLevel"
			bind:value={d.urgencyLevel as unknown as string}
			options={[
				{ value: '1', label: '1 - Routine' },
				{ value: '2', label: '2 - Non-Urgent Follow-up' },
				{ value: '3', label: '3 - Semi-Urgent' },
				{ value: '4', label: '4 - Urgent' },
				{ value: '5', label: '5 - Critical/Emergency' }
			]}
		/>
		<TextInput label="Reviewer Name" name="reviewerName" bind:value={d.reviewerName} placeholder="e.g. Dr Patel" />
	</div>

	<TextInput label="Review Date" name="reviewDate" type="date" bind:value={d.reviewDate} />
	<TextArea label="Additional Notes" name="additionalNotes" bind:value={d.additionalNotes} placeholder="Any additional clinical notes or observations" />
</SectionCard>
