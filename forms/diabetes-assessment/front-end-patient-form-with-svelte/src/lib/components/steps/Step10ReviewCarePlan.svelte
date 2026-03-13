<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const d = assessment.data.reviewCarePlan;
</script>

<SectionCard title="Review & Care Plan" description="Complete the review with care plan details and follow-up arrangements.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Clinician Name" name="clinicianName" bind:value={d.clinicianName} placeholder="e.g. Dr Johnson" />
		<TextInput label="Review Date" name="reviewDate" type="date" bind:value={d.reviewDate} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Agreed HbA1c Target" name="hba1cTargetAgreed" bind:value={d.hba1cTargetAgreed} step="0.1" min={0} placeholder="e.g. 53 mmol/mol or 7.0%" />
		<RadioGroup
			label="Care Plan Updated"
			name="carePlanUpdated"
			bind:value={d.carePlanUpdated}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<TextArea label="Clinical Notes" name="clinicalNotes" bind:value={d.clinicalNotes} rows={4} placeholder="Summary of clinical findings and discussion" />

	<TextArea label="Referrals Made" name="referrals" bind:value={d.referrals} rows={3} placeholder="e.g. Ophthalmology, Podiatry, Dietetics, Psychology" />

	<TextInput label="Next Review Date" name="nextReviewDate" type="date" bind:value={d.nextReviewDate} />
</SectionCard>
