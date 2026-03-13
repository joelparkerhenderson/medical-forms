<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.screeningPurpose;
</script>

<SectionCard title="Screening Purpose" description="Reason for this autism screening assessment">
	<SelectInput
		label="Referral Source"
		name="referralSource"
		options={[
			{ value: 'self', label: 'Self-referral' },
			{ value: 'gp', label: 'GP / Primary care' },
			{ value: 'school', label: 'School / Education' },
			{ value: 'employer', label: 'Employer / Occupational health' },
			{ value: 'family', label: 'Family member' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={s.referralSource}
		required
	/>

	{#if s.referralSource === 'other'}
		<TextInput
			label="Other referral source"
			name="referralSourceOther"
			bind:value={s.referralSourceOther}
			placeholder="Please specify..."
		/>
	{/if}

	<TextArea
		label="Reason for screening"
		name="reasonForScreening"
		bind:value={s.reasonForScreening}
		placeholder="Describe the primary reason for seeking an autism screening..."
	/>

	<RadioGroup
		label="Have there been any previous autism assessments?"
		name="previousAssessments"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={s.previousAssessments}
		required
	/>

	{#if s.previousAssessments === 'yes'}
		<TextArea
			label="Previous assessment details"
			name="previousAssessmentDetails"
			bind:value={s.previousAssessmentDetails}
			placeholder="Provide details of previous assessments, dates, and outcomes..."
		/>
	{/if}
</SectionCard>
